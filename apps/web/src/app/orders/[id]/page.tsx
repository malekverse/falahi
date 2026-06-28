import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatTND } from '@filahi/types'
import { OrderRatings } from '@/components/orders/OrderRatings'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-gold-100 text-gold-700' },
  confirmed: { label: 'Confirmée', color: 'bg-olive-100 text-olive-700' },
  in_transit: { label: 'En transit', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-terra-500' },
  refunded: { label: 'Remboursée', color: 'bg-ink-100 text-ink-600' },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const tripId = order.trip_id as string | undefined

  let farmerId: string | undefined
  let farmerName = 'le vendeur'
  let driverId: string | undefined
  let driverName: string | undefined
  let driverLat: number | undefined
  let driverLng: number | undefined

  if (tripId) {
    const { data: trip } = await supabase
      .from('trips')
      .select('farmer_id, driver_id, last_ping_at')
      .eq('id', tripId)
      .single()

    if (trip) {
      farmerId = trip.farmer_id
      const { data: farmer } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', trip.farmer_id)
        .single()
      if (farmer) farmerName = farmer.full_name

      driverId = trip.driver_id || undefined
      if (driverId) {
        const { data: driver } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', driverId)
          .single()
        if (driver) driverName = driver.full_name
      }

      if (trip.last_ping_at) {
        const { data: ping } = await supabase
          .from('location_pings')
          .select('lat, lng')
          .eq('trip_id', tripId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (ping) {
          driverLat = ping.lat
          driverLng = ping.lng
        }
      }
    }
  }

  const isDelivered = order.status === 'delivered' || order.status === 'settled'
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-ink-100 text-ink-600' }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/orders" className="mb-4 flex items-center gap-1 text-sm text-ink-500 transition-colors hover:text-olive-700">
        ← Mes commandes
      </Link>

      <div className="mb-8">
        <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
          الطلب — Commande
        </p>
        <h1 className="section-title mt-1">Commande #{id.slice(0, 8)}</h1>
      </div>

      <div className="card mb-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-ink-500">Statut</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-ink-500">Total</span>
          <span className="font-display text-xl font-bold text-ink-900">
            {formatTND(order.total_price_millimes)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">Date</span>
          <span className="text-sm text-ink-700">
            {new Date(order.created_at).toLocaleDateString('fr-TN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        {order.delivery_address && (
          <div className="mt-3 flex items-start justify-between">
            <span className="text-sm text-ink-500">Adresse</span>
            <span className="max-w-[60%] text-right text-sm text-ink-700">{order.delivery_address}</span>
          </div>
        )}
      </div>

      {driverId && driverName && tripId && (
        <div className="card mb-6 p-5">
          <h2 className="font-display text-base font-bold text-ink-800">Livraison</h2>
          <p className="mt-2 text-sm text-ink-600">Chauffeur: {driverName}</p>
          {driverLat && driverLng && (
            <div className="mt-3 h-40 w-full overflow-hidden rounded-lg bg-cream-100">
              <iframe
                title="Position du chauffeur"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${driverLng - 0.01}%2C${driverLat - 0.01}%2C${driverLng + 0.01}%2C${driverLat + 0.01}&layer=transportmap&marker=${driverLat}%2C${driverLng}`}
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-4 font-display text-base font-bold text-ink-800">Articles</h2>
        <div className="space-y-2">
          {(order.order_items || []).map((item: { id: number; quantity: number; unit_price_millimes: number; total_millimes: number }) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-cream-50 px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium text-ink-900">{item.quantity}x</span>
                <span className="ml-1 text-sm text-ink-500">{formatTND(item.unit_price_millimes)}</span>
              </div>
              <span className="text-sm font-medium text-ink-900">{formatTND(item.total_millimes)}</span>
            </div>
          ))}
        </div>
      </div>

      {isDelivered && tripId && farmerId && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-base font-bold text-ink-800">Évaluer</h2>
          <OrderRatings
            orderId={id}
            tripId={tripId}
            farmerId={farmerId}
            farmerName={farmerName}
            driverId={driverId}
            driverName={driverName}
          />
        </div>
      )}
    </div>
  )
}
