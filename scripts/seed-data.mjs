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
  const farmerIds = []

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
      farmerIds.push(u.user.id)
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

  // Create delivery zones
  const zones = [
    { name: 'La Marsa', coords: 'POLYGON((10.3159 36.8663, 10.3350 36.8800, 10.3550 36.8700, 10.3400 36.8550, 10.3159 36.8663))' },
    { name: 'Ariana', coords: 'POLYGON((10.1850 36.8600, 10.2100 36.8750, 10.2250 36.8650, 10.2050 36.8500, 10.1850 36.8600))' },
    { name: 'Centre Tunis', coords: 'POLYGON((10.1550 36.7950, 10.1800 36.8100, 10.2000 36.8000, 10.1750 36.7850, 10.1550 36.7950))' },
  ]
  for (const zone of zones) {
    await supabase.from('delivery_zones').insert({
      hub_id: hub.id,
      name: zone.name,
      boundary: zone.coords,
      is_active: true,
    })
  }
  console.log(`✅ ${zones.length} delivery zones created`)

  // Create inventory items for each farmer
  const products = [
    { farmerIdx: 0, name: 'بيض بلدي', category: 'eggs', qty: 200, unit: 'hara', price: 800, region: 'Béja' },
    { farmerIdx: 0, name: 'زيت زيتون', category: 'olive_oil', qty: 50, unit: 'litra', price: 12000, region: 'Béja' },
    { farmerIdx: 1, name: 'طماطم', category: 'vegetables', qty: 100, unit: 'kg', price: 2500, region: 'Nabeul' },
    { farmerIdx: 1, name: 'فلفل', category: 'vegetables', qty: 60, unit: 'kg', price: 3500, region: 'Nabeul' },
    { farmerIdx: 2, name: 'زيت زيتون', category: 'olive_oil', qty: 100, unit: 'litra', price: 11000, region: 'Sfax' },
    { farmerIdx: 2, name: 'لوز', category: 'legumes', qty: 80, unit: 'kg', price: 9000, region: 'Sfax' },
    { farmerIdx: 3, name: 'بطاطا', category: 'vegetables', qty: 300, unit: 'kg', price: 1800, region: 'Kairouan' },
    { farmerIdx: 3, name: 'بصل', category: 'vegetables', qty: 150, unit: 'kg', price: 2200, region: 'Kairouan' },
    { farmerIdx: 4, name: 'عسل', category: 'honey', qty: 30, unit: 'kg', price: 25000, region: 'Zaghouan' },
    { farmerIdx: 4, name: 'تمر', category: 'fruit', qty: 200, unit: 'kg', price: 8000, region: 'Zaghouan' },
  ]

  for (const p of products) {
    const farmerId = farmerIds[p.farmerIdx]
    if (!farmerId) continue
    const commissionRate = 0.12
    const platformPrice = Math.round(p.price * (1 + commissionRate))
    await supabase.from('inventory_items').insert({
      farmer_id: farmerId,
      product_name: p.name,
      product_category: p.category,
      quantity: p.qty,
      unit: p.unit,
      asking_price_millimes: p.price,
      platform_price_millimes: platformPrice,
      location_name: p.region,
      status: 'available',
      source: 'seed',
    })
    console.log(`  📦 ${p.name} — ${p.qty} ${p.unit} — ${formatTnd(p.price)}`)
  }

  // Create driver profiles
  const drivers = [
    { name: 'Ahmed Nafti', phone: '+21650111222', plate: '123 TUN 123', vehicle: 'Isuzu D-Max' },
    { name: 'Sami Slama', phone: '+21650333444', plate: '456 TUN 456', vehicle: 'Peugeot Partner' },
  ]
  for (const driver of drivers) {
    const { data: u } = await supabase.auth.admin.createUser({
      phone: driver.phone,
      password: 'TestDriver123!',
      user_metadata: { role: 'driver', full_name: driver.name },
    })
    if (u?.user) {
      await supabase.from('profiles').upsert({
        id: u.user.id,
        full_name: driver.name,
        phone_number: driver.phone,
        role: 'driver',
        preferred_lang: 'fr',
      })
      await supabase.from('driver_profiles').upsert({
        id: u.user.id,
        name: driver.name,
        phone: driver.phone,
        plate_number: driver.plate,
        vehicle_type: driver.vehicle,
        trust_tier: 1,
        trust_score: 0,
        is_verified: false,
      })
      console.log(`  🚛 Driver ${driver.name} created: ${u.user.id}`)
    }
  }

  console.log('\n🎉 Seed complete!')
  console.log('  Admin: test@filahi.tn / TestAdmin123!')
  console.log('  Buyers: any with password TestBuyer123!')
  console.log('  Drivers: any with password TestDriver123!')
}

function formatTnd(millimes) {
  return `${(millimes / 1000).toFixed(1)} TND`
}

seed().catch(console.error)
