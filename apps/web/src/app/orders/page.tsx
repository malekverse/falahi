import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatTND } from '@filahi/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-gold-100 text-gold-700' },
  confirmed: { label: 'Confirmée', color: 'bg-olive-100 text-olive-700' },
  in_transit: { label: 'En transit', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-terra-500' },
  refunded: { label: 'Remboursée', color: 'bg-ink-100 text-ink-600' },
}

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Connectez-vous</h1>
        <p className="mt-2 text-sm text-ink-500">Veuillez vous connecter pour voir vos commandes.</p>
        <Link href="/login" className="btn-primary mt-6 inline-block">Connexion</Link>
      </div>
    )
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        طلباتي — Mes commandes
      </p>
      <h1 className="section-title mt-1">Mes commandes</h1>

      {(!orders || orders.length === 0) ? (
        <div className="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-4xl">📦</span>
          <p className="text-lg font-medium text-ink-700">Aucune commande pour le moment</p>
          <p className="text-sm text-ink-500">
            Parcourez le marché et passez votre première commande.
          </p>
          <Link href="/marketplace" className="btn-primary mt-2">
            Voir le marché
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => {
            const info = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-ink-100 text-ink-600' }
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="card flex items-center justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium text-ink-900">
                    Commande #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(order.created_at).toLocaleDateString('fr-TN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-right font-medium text-ink-900">
                    {formatTND(order.total_price_millimes)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${info.color}`}>
                    {info.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
