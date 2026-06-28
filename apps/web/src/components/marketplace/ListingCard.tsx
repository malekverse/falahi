import { formatTND } from '@filahi/types'
import type { Millimes } from '@filahi/types'
import { FreshnessBar } from '@filahi/ui'

interface ListingCardItem {
  id: number
  product_name: string
  product_category: string
  quantity: number
  unit: string
  platform_price_millimes: Millimes | null
  location_name: string
  harvest_date: string | null
  shelf_life_days: number | null
  created_at: string
}

export function ListingCard({ item }: { item: ListingCardItem }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold">{item.product_name}</h3>
      </div>

      <p className="mb-1 text-sm text-gray-600">
        {item.quantity} {item.unit}
      </p>

      <p className="mb-1 text-sm text-gray-600">
        {item.location_name}
      </p>

      {item.platform_price_millimes && (
        <p className="mb-3 text-xl font-bold text-green-700">
          {formatTND(item.platform_price_millimes)}
        </p>
      )}

      <div className="mb-2">
        <FreshnessBar harvestDate={item.harvest_date} shelfLifeDays={item.shelf_life_days} />
      </div>

      <div className="text-xs text-gray-400">
        {item.harvest_date && (
          <span>Récolté le {new Date(item.harvest_date).toLocaleDateString('fr-TN')}</span>
        )}
      </div>
    </div>
  )
}
