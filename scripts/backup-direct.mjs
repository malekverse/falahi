import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Run with: pnpm --filter web exec node scripts/backup-direct.mjs')
  process.exit(1)
}

const TABLES = [
  'profiles',
  'inventory_items',
  'trips',
  'orders',
  'order_items',
  'hubs',
  'delivery_zones',
  'sub_trips',
  'driver_profiles',
  'ledger_entries',
  'disputes',
  'group_buys',
  'group_buy_participants',
  'ratings',
  'whatsapp_messages',
  'whatsapp_otps',
  'trip_location_cache',
]

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function backup() {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dir = `./backups/${timestamp}`
  const { mkdir, writeFile } = await import('node:fs/promises')
  const { existsSync } = await import('node:fs')
  const { resolve } = await import('node:path')

  if (!existsSync('./backups')) {
    await mkdir('./backups', { recursive: true })
  }
  await mkdir(dir, { recursive: true })

  const manifest = { timestamp: now.toISOString(), tables: {} }
  let totalRows = 0
  let failedTables = []

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) {
      console.error(`  ❌ ${table}: ${error.message}`)
      failedTables.push(table)
      manifest.tables[table] = { status: 'error', error: error.message }
      continue
    }
    const rows = data ?? []
    const filePath = resolve(`${dir}/${table}.json`)
    await writeFile(filePath, JSON.stringify(rows, null, 2))
    manifest.tables[table] = { status: 'ok', rowCount: rows.length, file: `${table}.json` }
    totalRows += rows.length
    console.log(`  ✅ ${table}: ${rows.length} rows → ${filePath}`)
  }

  const manifestPath = resolve(`${dir}/manifest.json`)
  manifest.totalRows = totalRows
  manifest.failedTables = failedTables
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

  console.log(`\n📦 Backup complete: ${dir}/`)
  console.log(`   Total rows: ${totalRows}`)
  if (failedTables.length > 0) {
    console.log(`   Failed tables: ${failedTables.join(', ')}`)
  }

  const latestPath = resolve('./backups/latest.json')
  await writeFile(latestPath, JSON.stringify(manifest, null, 2))
  console.log(`   Latest manifest: backups/latest.json`)
}

backup().catch((err) => {
  console.error('Backup failed:', err)
  process.exit(1)
})
