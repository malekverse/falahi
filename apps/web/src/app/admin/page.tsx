import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StaleTripsAlert } from '@/components/admin/StaleTripsAlert'

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
    { label: 'Trajets actifs', value: activeTrips ?? 0, color: 'from-olive-500 to-olive-700' },
    { label: 'Commandes en attente', value: pendingOrders ?? 0, color: 'from-gold-400 to-amber-600' },
    { label: 'Produits disponibles', value: available ?? 0, color: 'from-olive-400 to-olive-600' },
    { label: 'Litiges ouverts', value: openDisputes ?? 0, color: 'from-red-400 to-terra-500' },
    { label: 'Agriculteurs', value: farmers ?? 0, color: 'from-olive-300 to-olive-500' },
    { label: 'Chauffeurs', value: drivers ?? 0, color: 'from-olive-600 to-olive-800' },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
           لوحة القيادة — Administration
        </p>
        <h1 className="section-title mt-1 text-3xl">Tableau de bord</h1>
      </div>
      <div className="mb-4">
        <StaleTripsAlert />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Indicateurs clés">
        {cards.map((card) => (
          <div
            key={card.label}
            className="card relative overflow-hidden p-5"
            role="listitem"
            aria-label={`${card.label}: ${card.value}`}
          >
            <div className={`absolute right-0 top-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-xl`} />
            <p className="font-display text-3xl font-black text-ink-900">{card.value}</p>
            <p className="mt-1 text-sm text-ink-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
