import type { AIListingExtraction } from '@filahi/types'
import { LISTING_EXTRACTION_PROMPT } from './llm-prompts'

export async function transcribeDarija(
  audioBuffer: ArrayBuffer,
): Promise<{ text: string; confidence: number }> {
  // Try Groq Whisper first, fallback to OpenAI Whisper
  const groqKey = process.env.GROQ_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY

  if (groqKey) {
    try {
      return await transcribeWithGroq(audioBuffer, groqKey)
    } catch (err) {
      console.error('Groq transcription failed, falling back to OpenAI:', err)
    }
  }

  if (openAiKey) {
    return await transcribeWithOpenAI(audioBuffer, openAiKey)
  }

  throw new Error('No API key configured for transcription (GROQ_API_KEY or OPENAI_API_KEY)')
}

async function transcribeWithGroq(
  audioBuffer: ArrayBuffer,
  apiKey: string,
): Promise<{ text: string; confidence: number }> {
  const blob = new Blob([audioBuffer], { type: 'audio/ogg' })
  const formData = new FormData()
  formData.append('file', blob, 'audio.ogg')
  formData.append('model', 'whisper-large-v3')
  formData.append('language', 'ar')
  formData.append('response_format', 'json')

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Groq transcription failed: ${response.status}`)
  }

  const data = await response.json() as { text: string }
  return { text: data.text, confidence: 0.85 }
}

async function transcribeWithOpenAI(
  audioBuffer: ArrayBuffer,
  apiKey: string,
): Promise<{ text: string; confidence: number }> {
  const blob = new Blob([audioBuffer], { type: 'audio/ogg' })
  const formData = new FormData()
  formData.append('file', blob, 'audio.ogg')
  formData.append('model', 'whisper-1')
  formData.append('language', 'ar')
  formData.append('response_format', 'json')

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(`OpenAI transcription failed: ${response.status}`)
  }

  const data = await response.json() as { text: string }
  return { text: data.text, confidence: 0.85 }
}

export async function extractListingFromText(
  transcription: string,
  llmApiKey?: string,
): Promise<AIListingExtraction> {
  const apiKey = llmApiKey || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('No API key for LLM extraction (OPENAI_API_KEY)')
  }

  const prompt = LISTING_EXTRACTION_PROMPT.replace('{TRANSCRIPTION}', transcription)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM extraction failed: ${response.status}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('LLM returned empty response')
  }

  try {
    return JSON.parse(content) as AIListingExtraction
  } catch {
    throw new Error(`Failed to parse LLM response as JSON: ${content}`)
  }
}

export async function flagForAdminReview(
  waId: string,
  messageId: string,
  text: string,
  confidence: number,
) {
  console.warn(
    `[ADMIN_FLAG] Low confidence transcription from ${waId}`,
    { waId, messageId, text, confidence },
  )
}
