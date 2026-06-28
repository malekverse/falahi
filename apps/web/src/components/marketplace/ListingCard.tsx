import React from 'react'
import { formatTND } from '@filahi/types'
import type { Millimes } from '@filahi/types'
import { FreshnessBar, FairPriceWidget } from '@filahi/ui'

export interface ListingCardItem {
  id: number
  product_name: string
  product_category: string
  quantity: number
  unit: string
  asking_price_millimes: Millimes | null
  platform_price_millimes: Millimes | null
  location_name: string
  harvest_date: string | null
  shelf_life_days: number | null
  created_at: string
}

export const ListingCard = React.memo(function ListingCard({ item }: { item: ListingCardItem }) {
  return (
    <div
      className="market-card"
      role="article"
      aria-label={`${item.product_name}, ${item.quantity} ${item.unit}, ${item.platform_price_millimes ? formatTND(item.platform_price_millimes) : ''}, ${item.location_name}`}
    >
      <div className="p-4 pt-5">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-bold text-ink-900">{item.product_name}</h3>
        </div>

        <div className="mb-3 space-y-1">
          <p className="text-sm text-ink-500" aria-label={`Quantité: ${item.quantity} ${item.unit}`}>
            <span className="inline-block w-5 text-center text-ink-400">#</span> {item.quantity} {item.unit}
          </p>
          <p className="text-sm text-ink-500" aria-label={`Origine: ${item.location_name}`}>
            <span className="inline-block w-5 text-center text-ink-400">📍</span> {item.location_name}
          </p>
        </div>

        {item.platform_price_millimes && (
          <p className="price-tag mb-3 inline-block text-base" aria-label={`Prix: ${formatTND(item.platform_price_millimes)}`}>
            {formatTND(item.platform_price_millimes)}
          </p>
        )}

        {item.asking_price_millimes && (
          <div className="mb-2" role="complementary" aria-label="Comparaison de prix équitables">
            <FairPriceWidget
              askingPriceMillimes={item.asking_price_millimes}
              platformPriceMillimes={item.platform_price_millimes}
            />
          </div>
        )}

        <div className="mb-2" aria-label={`Fraîcheur: ${item.harvest_date ? `Récolté le ${new Date(item.harvest_date).toLocaleDateString('fr-TN')}` : 'Non spécifié'}`}>
          <FreshnessBar harvestDate={item.harvest_date} shelfLifeDays={item.shelf_life_days} />
        </div>

        <div className="text-[11px] text-ink-400">
          {item.harvest_date && (
            <span>Récolté le {new Date(item.harvest_date).toLocaleDateString('fr-TN')}</span>
          )}
        </div>
      </div>
    </div>
  )
})
