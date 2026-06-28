import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatTND } from '@filahi/types'
import { OrderRatings } from '@/components/orders/OrderRatings'

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

  if (tripId) {
    const { data: trip } = await supabase
      .from('trips')
      .select('farmer_id, driver_id')
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
    }
  }

  const isDelivered = order.status === 'delivered' || order.status === 'settled'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Commande #{order.id.slice(0, 8)}</h1>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex justify-between">
          <span className="text-gray-600">Statut</span>
          <span className="font-medium capitalize">{order.status}</span>
        </div>
        <div className="mb-2 flex justify-between">
          <span className="text-gray-600">Total</span>
          <span className="font-bold text-green-700">
            {formatTND(order.total_price_millimes)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date</span>
          <span>{new Date(order.created_at).toLocaleDateString('fr-TN')}</span>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Articles</h2>
      {(order.order_items || []).map((item: { id: number; quantity: number; unit_price_millimes: number; total_millimes: number }) => (
        <div
          key={item.id}
          className="mb-2 rounded border border-gray-100 bg-gray-50 p-3"
        >
          <div className="flex justify-between">
            <span>{item.quantity}x</span>
            <span>{formatTND(item.unit_price_millimes)}</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            Total: {formatTND(item.total_millimes)}
          </div>
        </div>
      ))}

      {isDelivered && tripId && farmerId && (
        <div className="mt-8">
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
