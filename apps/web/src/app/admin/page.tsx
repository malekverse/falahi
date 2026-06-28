import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: activeTrips },
    { count: pendingOrders },
    { count: openDisputes },
    { count: farmers },
    { count: drivers },
    { count: available },
  ] = await Promise.all([
    supabase.from('trips').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'in_transit', 'arrived_hub']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('status', 'available'),
  ])

  const cards = [
    { label: 'Trajets actifs', value: activeTrips ?? 0, color: 'bg-blue-500' },
    { label: 'Commandes en attente', value: pendingOrders ?? 0, color: 'bg-yellow-500' },
    { label: 'Produits disponibles', value: available ?? 0, color: 'bg-green-500' },
    { label: 'Litiges ouverts', value: openDisputes ?? 0, color: 'bg-red-500' },
    { label: 'Agriculteurs', value: farmers ?? 0, color: 'bg-purple-500' },
    { label: 'Chauffeurs', value: drivers ?? 0, color: 'bg-indigo-500' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Indicateurs clés">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            role="listitem"
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className={`mb-2 h-2 w-12 rounded ${card.color}`} aria-hidden="true" />
            <p className="text-2xl font-bold" aria-label={`${card.value} ${card.label}`}>{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
