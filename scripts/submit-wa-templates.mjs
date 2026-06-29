import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const TEMPLATES_FILE = resolve('docs/meta-whatsapp/templates.json')
const API_BASE = 'https://graph.facebook.com/v21.0'
const TOKEN = process.env.META_WA_ACCESS_TOKEN

if (!TOKEN) {
  console.error('❌ META_WA_ACCESS_TOKEN not set')
  console.error('   Run with: set META_WA_ACCESS_TOKEN=... && node scripts/submit-wa-templates.mjs')
  process.exit(1)
}

async function submitTemplate(template) {
  const url = `${API_BASE}/message_templates`
  const body = {
    name: template.name,
    category: template.category,
    language: template.language,
    components: [
      {
        type: 'BODY',
        text: template.body,
        example: template.example,
      },
    ],
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const result = await response.json()
  return { status: response.status, ok: response.ok, result }
}

async function main() {
  const content = await readFile(TEMPLATES_FILE, 'utf-8')
  const { templates } = JSON.parse(content)

  console.log(`📋 Found ${templates.length} templates to submit\n`)

  let success = 0
  let failed = 0

  for (const template of templates) {
    process.stdout.write(`  Submitting "${template.name}"... `)
    const { status, ok, result } = await submitTemplate(template)

    if (ok) {
      console.log(`✅ (${status})`)
      if (result.id) console.log(`       ID: ${result.id}`)
      success++
    } else if (result?.error?.code === 100 && result?.error?.error_subcode === 1872003) {
      console.log(`⚠️  Already exists (${status})`)
      success++
    } else if (status === 401 || status === 403) {
      console.log(`❌ Auth failed (${status}): Token may be expired or lacks permissions`)
      console.log(`   ${result?.error?.message ?? 'Unknown error'}`)
      failed++
      break
    } else {
      console.log(`❌ (${status}): ${result?.error?.message ?? JSON.stringify(result)}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${success} submitted, ${failed} failed`)
  if (failed > 0) {
    console.log('\n⚠️  Submit the failed templates manually via the Meta Business Platform:')
    console.log('   https://business.facebook.com/wa/manage/message-templates/')
    process.exit(1)
  }
}

main().catch(console.error)
