# WHATSAPP_BOT.md — Farmer Bot Specification
## Filahi — WhatsApp Cloud API Integration

> The bot is the most critical piece of the farmer experience.
> Every interaction must be in Tunisian Darija. Never respond in Modern Standard Arabic or French to farmers.
> This file defines all bot messages, state machine, and LLM prompts.

---

## 1. Webhook Setup (Next.js Route)

**File:** `apps/web/app/api/webhooks/whatsapp/route.ts`

```
GET  /api/webhooks/whatsapp  → Verification handshake with Meta
POST /api/webhooks/whatsapp  → Incoming messages
```

### GET Handler (Verification)
Meta calls this once when you register the webhook:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WA_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}
```

### POST Handler (Messages) — Critical: return 200 immediately

```typescript
export async function POST(request: Request) {
  // 1. Verify signature
  const signature = request.headers.get('x-hub-signature-256')
  const body = await request.text()
  // verify HMAC-SHA256 of body against META_WA_APP_SECRET

  if (!isValidSignature(body, signature)) {
    return new Response('Unauthorized', { status: 403 })
  }

  const payload = JSON.parse(body)

  // 2. Return 200 IMMEDIATELY (before any processing)
  // Use waitUntil to run processing async
  const ctx = (request as any).waitUntil  // Vercel edge runtime

  // Extract message from payload
  const message = extractMessage(payload)
  if (!message) return new Response('OK', { status: 200 })

  // 3. Process asynchronously
  ctx?.(processWhatsAppMessage(message))
  // Fallback if not edge runtime: don't await, fire-and-forget
  if (!ctx) processWhatsAppMessage(message).catch(console.error)

  return new Response('OK', { status: 200 })
}
```

---

## 2. Message Type Handlers

### Audio Message Handler (Primary Flow)

```typescript
async function handleAudioMessage(waId: string, mediaId: string, messageId: string) {
  // Idempotency check
  const existing = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('wa_message_id', messageId)
    .single()

  if (existing.data) return  // Already processed

  // Log inbound
  await supabase.from('whatsapp_messages').insert({
    wa_message_id: messageId,
    direction: 'inbound',
    wa_sender_id: waId,
    message_type: 'audio'
  })

  // Download audio from Meta CDN
  const audioBuffer = await downloadMetaMedia(mediaId)

  // Transcribe (Darija)
  const { text, confidence } = await transcribeDarija(audioBuffer)

  if (confidence < parseFloat(process.env.AI_CONFIDENCE_THRESHOLD!)) {
    await sendWhatsAppMessage(waId, BOT_MESSAGES.clarification_needed)
    await flagForAdminReview(waId, messageId, text, confidence)
    return
  }

  // Extract structured data
  const extraction = await extractListingFromText(text)

  if (extraction.confidence_score < 0.75) {
    await sendWhatsAppMessage(waId, BOT_MESSAGES.clarification_needed)
    return
  }

  // Ensure farmer profile exists
  const farmer = await upsertFarmerProfile(waId)

  // Create pending listing
  const listing = await supabase.from('inventory_items').insert({
    farmer_id: farmer.id,
    product_name: extraction.product_name,
    product_category: mapToCategory(extraction.product_name),
    quantity: extraction.quantity,
    unit: extraction.unit,
    asking_price_millimes: Math.round((extraction.asking_price_tnd ?? 0) * 1000),
    location_name: extraction.location_name,
    status: 'pending_confirmation',
    raw_transcription: text,
    ai_confidence_score: extraction.confidence_score,
    whatsapp_message_id: messageId
  }).select().single()

  // Send confirmation to farmer
  await sendConfirmationButton(waId, listing.data, extraction)
}
```

---

## 3. LLM System Prompt (Extraction)

This is the exact prompt to send to Claude/GPT-4o-mini for listing extraction.
Keep it in `packages/utils/llm-prompts.ts`:

```typescript
export const LISTING_EXTRACTION_PROMPT = `
You are an agricultural data extraction assistant for a Tunisian marketplace called Filahi.
You will receive transcribed text in Tunisian Darija (Arabic dialect) from a farmer describing produce they want to sell.

Extract the following information and return ONLY valid JSON, no preamble, no markdown:

{
  "product_name": "string (standardized Arabic name, e.g. 'بيض بلدي', 'بطاطا', 'طماطم')",
  "quantity": "number",
  "unit": "one of: kg | hara | litra | crate | piece | ton",
  "location_name": "string (Tunisian city or region)",
  "asking_price_tnd": "number or null (price per unit in TND, null if not mentioned)",
  "harvest_date": "ISO date string or null",
  "notes": "string or null (any other relevant info)",
  "confidence_score": "number between 0.0 and 1.0"
}

IMPORTANT RULES:
1. "hara" (حارة) = 1 crate of 30 eggs. Always use unit "hara" for egg crates.
2. If product requires refrigeration (milk, meat, yogurt, fish): set confidence_score to 0.0 and notes to "product_not_supported_phase1"
3. Common Darija numbers: واحد=1, زوز=2, ثلاثة=3, أربعة=4, خمسة=5, عشرة=10, مية=100, مياتين=200, ألف=1000
4. Common products: بيض بلدي=free-range eggs, دجاج عربي=free-range chicken, طماطم=tomatoes, بطاطا=potatoes, بصل=onions, عسل=honey, زيت زيتون=olive oil, تمر=dates
5. Set confidence_score to 0.0 if you cannot determine the product or quantity.
6. Do not invent information. If a field is unclear, set it to null.

Input text: {TRANSCRIPTION}
`
```

---

## 4. Bot Message Templates (Darija Only)

All bot messages must be in Tunisian Darija. Store in `packages/utils/bot-messages.ts`:

```typescript
export const BOT_MESSAGES = {

  // Sent when farmer messages for the first time
  welcome: (name?: string) => `
أهلاً وسهلاً ${name ? 'يا ' + name : ''}! 🌿
أنا بوت فلاحي. نقدر نعاونك تبيع محصولك مباشرة بسعر أحسن.

إرسلي رسالة صوتية أو كتابية فيها:
- شنو عندك للبيع
- الكمية
- وين أنت (المنطقة)

مثال: "عندي 200 حارة بيض بلدي في المطر"
  `.trim(),

  // Sent when audio confidence is too low
  clarification_needed: `
ما فهمتكش مليح 🙏
ممكن تعيد وترسلي رسالة صوتية واضحة أكثر؟
أو اكتب لي:
- شنو تحب تبيع
- الكمية
- المنطقة متاعك
  `.trim(),

  // Sent after successful extraction, before farmer confirms
  listing_confirmation: (item: {
    product_name: string,
    quantity: number,
    unit: string,
    location_name: string,
    asking_price_tnd?: number
  }) => `
تمام يا عمي! 👍 فهمت:

📦 المنتج: ${item.product_name}
🔢 الكمية: ${item.quantity} ${item.unit}
📍 المنطقة: ${item.location_name}
${item.asking_price_tnd ? `💰 السعر: ${item.asking_price_tnd} دينار` : ''}

هل تأكد؟
  `.trim(),

  // Sent after farmer confirms listing
  listing_live: `
ممتاز! 🎉 حطينا عرضك على الموقع.
المشترين يشوفوه دروا.
باش تعرف حال الفلوس، ابعثلي "فلوسي" في أي وقت.
  `.trim(),

  // Sent when farmer cancels listing
  listing_cancelled: `
تمام، حذفنا العرض.
باش تبيع، ابعثلي رسالة صوتية جديدة.
  `.trim(),

  // Sent when farmer queries payment status
  payment_status: (transactions: Array<{
    date: string,
    product: string,
    amount_tnd: number,
    status: 'pending' | 'paid'
  }>) => {
    if (transactions.length === 0) {
      return `ما عندكش معاملات حتى الآن. باش تبيع، ابعثلي رسالة بالمنتج متاعك.`
    }
    const lines = transactions.map(t =>
      `- ${t.date}: ${t.product} → ${t.amount_tnd} دينار (${t.status === 'paid' ? '✅ مدفوع' : '⏳ في الانتظار'})`
    )
    return `آخر معاملاتك:\n${lines.join('\n')}`
  },

  // OTP sent to farmer when driver arrives
  pickup_otp: (code: string, driverName: string) => `
🚛 السواق ${driverName} وصل عندك!
كودك السري: *${code}*
عطيه هذا الكود باش يأكد الاستلام.
  `.trim(),

  // After trip is settled
  payout_notice: (amount_tnd: number, method: string) => `
✅ تم التسليم بنجاح!
فلوسك: ${amount_tnd} دينار
طريقة الدفع: ${method}
نشكرك يا عمي، بارك الله فيك 🌿
  `.trim(),
}
```

---

## 5. WhatsApp Interactive Button Messages

For confirmation flow, use WhatsApp interactive buttons (not text):

```typescript
async function sendConfirmationButton(waId: string, listingId: number, extraction: AIListingExtraction) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: waId,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: BOT_MESSAGES.listing_confirmation({
              product_name: extraction.product_name,
              quantity: extraction.quantity,
              unit: extraction.unit,
              location_name: extraction.location_name,
              asking_price_tnd: extraction.asking_price_tnd ?? undefined
            })
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: { id: `CONFIRM_${listingId}`, title: '✅ تأكيد' }
              },
              {
                type: 'reply',
                reply: { id: `CANCEL_${listingId}`, title: '❌ إلغاء' }
              }
            ]
          }
        }
      })
    }
  )
}
```

---

## 6. Handling Button Replies

When farmer taps a button, Meta sends a webhook with `interactive.button_reply.id`:

```typescript
async function handleButtonReply(waId: string, buttonId: string) {
  if (buttonId.startsWith('CONFIRM_')) {
    const listingId = parseInt(buttonId.replace('CONFIRM_', ''))
    await supabase
      .from('inventory_items')
      .update({ status: 'available' })
      .eq('id', listingId)
      .eq('status', 'pending_confirmation')  // Safety check

    await sendWhatsAppMessage(waId, BOT_MESSAGES.listing_live)
  }

  if (buttonId.startsWith('CANCEL_')) {
    const listingId = parseInt(buttonId.replace('CANCEL_', ''))
    await supabase
      .from('inventory_items')
      .delete()
      .eq('id', listingId)
      .eq('status', 'pending_confirmation')  // Only delete pending, not live listings

    await sendWhatsAppMessage(waId, BOT_MESSAGES.listing_cancelled)
  }
}
```

---

## 7. Auto-Farmer Profile Creation

When a new WhatsApp number contacts the bot for the first time:

```typescript
async function upsertFarmerProfile(waId: string): Promise<Profile> {
  // Check if already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('whatsapp_id', waId)
    .single()

  if (existing) return existing

  // Create via service role (bypasses RLS for server-side creation)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create auth user with phone number
  const phoneNumber = `+${waId}`  // waId is in format 21620xxxxxx
  const { data: authUser } = await adminClient.auth.admin.createUser({
    phone: phoneNumber,
    user_metadata: { role: 'farmer' }
  })

  // Create profile
  const { data: profile } = await adminClient.from('profiles').insert({
    id: authUser.user!.id,
    full_name: 'Agriculteur',  // Placeholder; admin can update
    phone_number: phoneNumber,
    role: 'farmer',
    whatsapp_id: waId,
    preferred_lang: 'ar'
  }).select().single()

  // Send welcome message
  await sendWhatsAppMessage(waId, BOT_MESSAGES.welcome())

  return profile!
}
```
