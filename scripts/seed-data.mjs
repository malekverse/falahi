import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function seed() {
  // Create admin
  const { data: adminUser } = await supabase.auth.admin.createUser({
    email: 'admin@filahi.tn',
    password: 'TestAdmin123!',
    email_confirm: true,
    user_metadata: { role: 'admin', full_name: 'Admin Filahi' },
  })
  if (adminUser?.user) {
    await supabase.from('profiles').upsert({
      id: adminUser.user.id,
      full_name: 'Admin Filahi',
      phone_number: '+21650123456',
      role: 'admin',
      preferred_lang: 'fr',
    })
    console.log('✅ Admin created:', adminUser.user.id)
  }

  // Create farmers
  const farmers = [
    { name: 'Farhat Fel Fel', phone: '+21655123456', region: 'Béja' },
    { name: 'Salah Salata', phone: '+21655234567', region: 'Nabeul' },
    { name: 'Monia Zitouna', phone: '+21655345678', region: 'Sfax' },
    { name: 'Hedi Hnayen', phone: '+21655456789', region: 'Kairouan' },
    { name: 'Rachid Romman', phone: '+21655567890', region: 'Zaghouan' },
  ]

  for (const farmer of farmers) {
    const { data: u } = await supabase.auth.admin.createUser({
      phone: farmer.phone,
      password: 'TestFarmer123!',
      user_metadata: { role: 'farmer', full_name: farmer.name },
    })
    if (u?.user) {
      await supabase.from('profiles').upsert({
        id: u.user.id,
        full_name: farmer.name,
        phone_number: farmer.phone,
        role: 'farmer',
        whatsapp_id: farmer.phone.replace('+', ''),
        preferred_lang: 'ar',
      })
      console.log(`  ✅ Farmer ${farmer.name} created: ${u.user.id}`)
    }
  }

  // Create buyers
  const buyers = [
    { name: 'Karim Restaurant La Marsa', phone: '+21650123457' },
    { name: 'Salwa Epicerie Ariana', phone: '+21650123458' },
    { name: 'Mohamed Hotel Tunis', phone: '+21650123459' },
  ]

  for (const buyer of buyers) {
    const { data: u } = await supabase.auth.admin.createUser({
      email: buyer.name.toLowerCase().replace(/\s+/g, '.') + '@filahi.tn',
      password: 'TestBuyer123!',
      email_confirm: true,
      user_metadata: { role: 'buyer', full_name: buyer.name },
    })
    if (u?.user) {
      await supabase.from('profiles').upsert({
        id: u.user.id,
        full_name: buyer.name,
        phone_number: buyer.phone,
        role: 'buyer',
        preferred_lang: 'fr',
      })
      console.log(`  ✅ Buyer ${buyer.name} created: ${u.user.id}`)
    }
  }

  // Create hub
  const { data: hub } = await supabase.from('hubs').upsert({
    name: 'Micro-Hub Bir El Kassaa',
    address: 'Bir El Kassaa, Ben Arous',
    coordinates: 'POINT(10.1526 36.7538)',
    is_active: true,
  }).select().single()
  console.log('✅ Hub created:', hub?.id)

  console.log('\n🎉 Seed complete! Logins:')
  console.log('  Admin: test@filahi.tn / TestAdmin123!')
  console.log('  Buyer: test-buyer@filahi.tn / TestBuyer123!')
}

seed().catch(console.error)
