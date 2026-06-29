import { NextResponse, type NextRequest } from 'next/server'
import { verifyWebhookSignature, extractMessage } from '@filahi/utils'
import { downloadMetaMedia, sendWhatsAppMessage, sendConfirmationButton } from '@filahi/utils'
import { transcribeDarija, extractListingFromText, flagForAdminReview } from '@filahi/utils'
import { sanitizeText } from '@filahi/utils'
import { createClient } from '@supabase/supabase-js'
import { BOT_MESSAGES } from '@filahi/utils'
import type { AIListingExtraction } from '@filahi/types'
import { checkRateLimit } from '@/lib/rate-limiter'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const AI_CONFIDENCE_THRESHOLD = 0.75

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.META_WA_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  const appSecret = process.env.META_WA_APP_SECRET

  if (appSecret) {
    const isValid = await verifyWebhookSignature(body, signature, appSecret)
    if (!isValid) {
      return new NextResponse('Unauthorized', { status: 403 })
    }
  }

  type VercelRequest = NextRequest & {
    waitUntil?: (promise: Promise<unknown>) => void
  }

  const vercelReq = request as VercelRequest

  if (vercelReq.waitUntil) {
    vercelReq.waitUntil(processMessage(body))
  } else {
    processMessage(body).catch(console.error)
  }

  return new NextResponse('OK', { status: 200 })
}

async function processMessage(rawBody: string) {
  try {
    const payload = JSON.parse(rawBody)
    const message = extractMessage(payload)

    if (!message) return

    if (!checkRateLimit(message.from, 30, 60_000)) {
      console.warn(`Rate limit exceeded for ${message.from}`)
      return
    }

    if (message.msgType === 'audio') {
      await handleAudioMessage(message.from, message.raw, message.msgId)
    } else if (message.msgType === 'text') {
      await handleTextMessage(message.from, message.raw)
    } else if (message.msgType === 'interactive') {
      await handleButtonReply(message.from, message.raw)
    }
  } catch (err) {
    console.error('Failed to process WhatsApp message:', err)
  }
}

async function handleAudioMessage(waId: string, raw: Record<string, unknown>, msgId: string) {
  const supabase = getServiceClient()

  const existing = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('wa_message_id', msgId)
    .single()

  if (existing.data) return

  await supabase.from('whatsapp_messages').insert({
    wa_message_id: msgId,
    direction: 'inbound',
    wa_sender_id: waId,
    message_type: 'audio',
  })

  const audio = raw?.audio as Record<string, unknown> | undefined
  const mediaId = audio?.id as string

  let audioBuffer: ArrayBuffer
  try {
    audioBuffer = await downloadMetaMedia(mediaId)
  } catch (err) {
    console.error('Failed to download media:', err)
    return
  }

  let transcription: { text: string; confidence: number }
  try {
    transcription = await transcribeDarija(audioBuffer)
  } catch (err) {
    console.error('Transcription failed:', err)
    return
  }

  await supabase
    .from('whatsapp_messages')
    .update({ audio_transcribed: transcription.text })
    .eq('wa_message_id', msgId)

  if (transcription.confidence < AI_CONFIDENCE_THRESHOLD) {
    await sendWhatsAppMessage(waId, BOT_MESSAGES.clarification_needed)
    await flagForAdminReview(waId, msgId, transcription.text, transcription.confidence)
    return
  }

  let extraction: AIListingExtraction
  try {
    extraction = await extractListingFromText(transcription.text)
  } catch (err) {
    console.error('LLM extraction failed:', err)
    return
  }

  if (extraction.confidence_score < AI_CONFIDENCE_THRESHOLD) {
    await sendWhatsAppMessage(waId, BOT_MESSAGES.clarification_needed)
    return
  }

  const farmer = await upsertFarmerProfile(waId)

  const productCategory = mapProductToCategory(extraction.product_name)

  const askingPriceMillimes = extraction.asking_price_tnd
    ? Math.round(extraction.asking_price_tnd * 1000)
    : null

  const { data: listing } = await supabase
    .from('inventory_items')
    .insert({
      farmer_id: farmer.id,
      product_name: sanitizeText(extraction.product_name, 200),
      product_category: productCategory,
      quantity: extraction.quantity,
      unit: extraction.unit,
      asking_price_millimes: askingPriceMillimes,
      location_name: sanitizeText(extraction.location_name, 200),
      status: 'pending_confirmation',
      raw_transcription: sanitizeText(transcription.text, 5000),
      ai_confidence_score: extraction.confidence_score,
      whatsapp_message_id: msgId,
      notes: extraction.notes ? sanitizeText(extraction.notes, 500) : null,
    })
    .select()
    .single()

  if (listing) {
    await sendConfirmationButton(
      waId,
      listing.id,
      extraction.product_name,
      extraction.quantity,
      extraction.unit,
      extraction.location_name,
      extraction.asking_price_tnd ?? undefined,
    )
  }
}

async function handleTextMessage(waId: string, raw: Record<string, unknown>) {
  const text = raw?.text as Record<string, unknown> | undefined
  const body = (text?.body as string) || ''

  const lowerBody = body.toLowerCase()

  if (lowerBody.includes('flousi') || lowerBody.includes('فلوسي') || lowerBody.includes('wesh jani')) {
    await handlePaymentQuery(waId)
    return
  }

  await sendWhatsAppMessage(waId, BOT_MESSAGES.clarification_needed)
}

async function handleButtonReply(waId: string, raw: Record<string, unknown>) {
  const interactive = raw?.interactive as Record<string, unknown> | undefined
  const buttonReply = interactive?.button_reply as Record<string, unknown> | undefined
  const buttonId = buttonReply?.id as string

  if (!buttonId) return

  const supabase = getServiceClient()

  if (buttonId.startsWith('CONFIRM_')) {
    const listingId = parseInt(buttonId.replace('CONFIRM_', ''), 10)

    await supabase
      .from('inventory_items')
      .update({ status: 'available' })
      .eq('id', listingId)
      .eq('status', 'pending_confirmation')

    await sendWhatsAppMessage(waId, BOT_MESSAGES.listing_live)
  }

  if (buttonId.startsWith('CANCEL_')) {
    const listingId = parseInt(buttonId.replace('CANCEL_', ''), 10)

    await supabase
      .from('inventory_items')
      .delete()
      .eq('id', listingId)
      .eq('status', 'pending_confirmation')

    await sendWhatsAppMessage(waId, BOT_MESSAGES.listing_cancelled)
  }
}

async function handlePaymentQuery(waId: string) {
  const supabase = getServiceClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_id', waId)
    .single()

  if (!profile) {
    await sendWhatsAppMessage(waId, BOT_MESSAGES.payment_status([]))
    return
  }

  const { data: trips } = await supabase
    .from('trips')
    .select('settled_at, cargo_value_millimes, status')
    .eq('driver_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const transactions = (trips || []).map((t) => ({
    date: t.settled_at
      ? new Date(t.settled_at).toLocaleDateString('ar-TN')
      : new Date().toLocaleDateString('ar-TN'),
    product: 'الشحنة',
    amount_tnd: Math.round((t.cargo_value_millimes || 0) / 1000),
    status: (t.status === 'settled' ? 'paid' : 'pending') as 'pending' | 'paid',
  }))

  await sendWhatsAppMessage(waId, BOT_MESSAGES.payment_status(transactions))
}

async function upsertFarmerProfile(waId: string): Promise<{ id: string }> {
  const supabase = getServiceClient()

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('whatsapp_id', waId)
    .single()

  if (existing) return existing

  const supabaseAuth = getServiceClient()
  const phoneNumber = `+${waId}`

  const { data: authUser, error: authError } = await supabaseAuth.auth.admin.createUser({
    phone: phoneNumber,
    user_metadata: { role: 'farmer' },
  })

  if (authError || !authUser?.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      full_name: 'Agriculteur',
      phone_number: phoneNumber,
      role: 'farmer',
      whatsapp_id: waId,
      preferred_lang: 'ar',
    })
    .select()
    .single()

  if (!profile) {
    throw new Error('Failed to create profile')
  }

  await sendWhatsAppMessage(waId, BOT_MESSAGES.welcome())

  return profile
}

function mapProductToCategory(productName: string): string {
  const name = productName.toLowerCase()

  if (name.includes('بيض') || name.includes('djej') || name.includes('بيض')) return 'eggs'
  if (name.includes('عسل') || name.includes('honey') || name.includes('ase') || name.includes('عسل')) return 'honey'
  if (name.includes('زيت') || name.includes('huile') || name.includes('olive') || name.includes('زيت')) return 'olive_oil'
  if (name.includes('طماطم') || name.includes('بطاطا') || name.includes('بصل') || name.includes('tomate') || name.includes('pomme'))
    return 'vegetables'
  if (name.includes('فول') || name.includes('لوبيا') || name.includes('حمص') || name.includes('légumes') || name.includes('legume'))
    return 'legumes'
  if (name.includes('قمح') || name.includes('شعير') || name.includes('blé') || name.includes('grain'))
    return 'grains'
  if (name.includes('نعناع') || name.includes('بقدونس') || name.includes('menthe') || name.includes('herbe'))
    return 'herbs'
  if (name.includes('تمر') || name.includes('تين') || name.includes('fruits') || name.includes('dates'))
    return 'fruit'

  return 'other'
}
