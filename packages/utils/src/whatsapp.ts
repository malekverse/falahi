import { BOT_MESSAGES } from './bot-messages'

const API_BASE = 'https://graph.facebook.com/v19.0'

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function downloadMetaMedia(mediaId: string): Promise<ArrayBuffer> {
  const mediaUrlResp = await fetch(
    `${API_BASE}/${mediaId}`,
    { headers: getHeaders() },
  )
  if (!mediaUrlResp.ok) {
    throw new Error(`Failed to get media URL: ${mediaUrlResp.status}`)
  }
  const mediaData = await mediaUrlResp.json() as { url: string }

  const audioResp = await fetch(mediaData.url, { headers: getHeaders() })
  if (!audioResp.ok) {
    throw new Error(`Failed to download audio: ${audioResp.status}`)
  }
  return audioResp.arrayBuffer()
}

export async function sendWhatsAppMessage(waId: string, text: string) {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID
  if (!phoneNumberId) {
    console.error('META_WA_PHONE_NUMBER_ID not set')
    return
  }

  await fetch(
    `${API_BASE}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: waId,
        type: 'text',
        text: { body: text },
      }),
    },
  )
}

export async function sendConfirmationButton(
  waId: string,
  listingId: number,
  productName: string,
  quantity: number,
  unit: string,
  locationName: string,
  askingPriceTnd?: number,
) {
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID
  if (!phoneNumberId) return

  await fetch(
    `${API_BASE}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: waId,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: BOT_MESSAGES.listing_confirmation({
              product_name: productName,
              quantity,
              unit,
              location_name: locationName,
              asking_price_tnd: askingPriceTnd,
            }),
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: { id: `CONFIRM_${listingId}`, title: '✅ تأكيد' },
              },
              {
                type: 'reply',
                reply: { id: `CANCEL_${listingId}`, title: '❌ إلغاء' },
              },
            ],
          },
        },
      }),
    },
  )
}

export function extractMessage(payload: Record<string, unknown>) {
  const entries = payload?.entry as Array<Record<string, unknown>> | undefined
  if (!entries?.length) return null

  for (const entry of entries) {
    const changes = entry.changes as Array<Record<string, unknown>> | undefined
    if (!changes?.length) continue

    for (const change of changes) {
      const value = change.value as Record<string, unknown> | undefined
      const messages = value?.messages as Array<Record<string, unknown>> | undefined
      if (!messages?.length) continue

      const msg = messages[0]
      const from = msg.from as string
      const msgId = msg.id as string
      const msgType = msg.type as string

      return { from, msgId, msgType, raw: msg }
    }
  }

  return null
}
