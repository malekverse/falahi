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
    { label: 'Trajets actifs', value: activeTrips ?? 0, accent: 'border-l-olive-700' },
    { label: 'Commandes en attente', value: pendingOrders ?? 0, accent: 'border-l-gold-500' },
    { label: 'Produits disponibles', value: available ?? 0, accent: 'border-l-olive-500' },
    { label: 'Litiges ouverts', value: openDisputes ?? 0, accent: 'border-l-terra-500' },
    { label: 'Agriculteurs', value: farmers ?? 0, accent: 'border-l-olive-400' },
    { label: 'Chauffeurs', value: drivers ?? 0, accent: 'border-l-olive-600' },
  ]

  return (
    <div>
      <h1 className="section-title mb-8">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Indicateurs clés">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`card border-l-4 p-5 ${card.accent}`}
            role="listitem"
            aria-label={`${card.label}: ${card.value}`}
          >
            <p className="font-display text-3xl font-bold text-ink-900">{card.value}</p>
            <p className="mt-1 text-sm text-ink-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
