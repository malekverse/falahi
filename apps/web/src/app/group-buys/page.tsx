import { createServerSupabaseClient } from '@/lib/supabase/server'
import { GroupBuyCard } from '@/components/marketplace/GroupBuyCard'
import type { GroupBuyWithItem } from '@filahi/types'

export const dynamic = 'force-dynamic'

export default async function GroupBuysPage() {
  const supabase = await createServerSupabaseClient()

  const { data: groupBuys } = await supabase
    .from('group_buys')
    .select(`
      *,
      inventory_items!inner(product_name, product_category),
      creators:profiles!group_buys_creator_id_fkey(name, location)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const items: GroupBuyWithItem[] = (groupBuys ?? []).map((gb) => ({
    id: gb.id,
    creator_id: gb.creator_id,
    inventory_item_id: gb.inventory_item_id,
    target_quantity: gb.target_quantity,
    current_quantity: gb.current_quantity,
    unit: gb.unit,
    unit_price_millimes: gb.unit_price_millimes,
    status: gb.status,
    expires_at: gb.expires_at,
    created_at: gb.created_at,
    fulfilled_at: gb.fulfilled_at,
    cancelled_at: gb.cancelled_at,
    product_name: gb.inventory_items?.product_name ?? '—',
    product_category: gb.inventory_items?.product_category ?? '—',
    creator_name: gb.creators?.name ?? null,
    creator_location: gb.creators?.location ?? null,
    item_image_url: null,
  }))

  const openBuys = items.filter((b) => b.status === 'open')
  const fulfilledBuys = items.filter((b) => b.status === 'fulfilled')

  return (
    <div>
      <div className="mb-8">
        <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
          شراء جماعي — Achats groupés
        </p>
        <h1 className="section-title mt-1">Achats groupés</h1>
        <p className="mt-2 max-w-lg text-sm text-ink-500">
          Commandez ensemble avec d&apos;autres acheteurs pour atteindre le minimum requis et bénéficier de prix réduits.
        </p>
      </div>

      {openBuys.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-display text-lg font-bold text-ink-800">En cours</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openBuys.map((gb) => (
              <GroupBuyCard key={gb.id} groupBuy={gb} />
            ))}
          </div>
        </section>
      )}

      {fulfilledBuys.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg font-bold text-ink-800">Objectifs atteints</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fulfilledBuys.map((gb) => (
              <GroupBuyCard key={gb.id} groupBuy={gb} />
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-4xl">🛒</span>
          <p className="text-lg font-medium text-ink-700">Aucun achat groupé pour le moment</p>
          <p className="text-sm text-ink-500">
            Soyez le premier à créer un achat groupé depuis la page d&apos;un produit.
          </p>
        </div>
      )}
    </div>
  )
}
