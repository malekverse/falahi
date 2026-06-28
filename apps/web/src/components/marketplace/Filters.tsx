'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

const CATEGORIES = [
  'all', 'vegetables', 'fruit', 'eggs', 'honey',
  'olive_oil', 'legumes', 'grains', 'herbs',
] as const

export function Filters({ regions }: { regions?: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''
  const currentRegion = searchParams.get('region') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const { t } = useTranslation()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/marketplace?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/marketplace')
  }

  const hasActiveFilters = currentCategory || currentRegion || currentMinPrice || currentMaxPrice

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const value = cat === 'all' ? '' : cat
          return (
            <button
              key={cat}
              onClick={() => updateParam('category', value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                currentCategory === value
                  ? 'bg-olive-700 text-white'
                  : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
              }`}
            >
              {cat === 'all' ? t.marketplace.filters.all : t.marketplace.filters[cat]}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {regions && regions.length > 0 && (
          <select
            value={currentRegion}
            onChange={(e) => updateParam('region', e.target.value)}
            className="rounded-lg border border-cream-200 bg-cream-50 px-3 py-1.5 text-sm text-ink-700 focus:border-olive-500 focus:outline-none"
            aria-label="Filtrer par région"
          >
            <option value="">Toutes les régions</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            placeholder="Prix min"
            value={currentMinPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-20 rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-sm text-ink-700 placeholder-ink-400 focus:border-olive-500 focus:outline-none"
            aria-label="Prix minimum en TND"
          />
          <span className="text-ink-400">—</span>
          <input
            type="number"
            min="0"
            placeholder="Prix max"
            value={currentMaxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-20 rounded-lg border border-cream-200 bg-cream-50 px-2 py-1.5 text-sm text-ink-700 placeholder-ink-400 focus:border-olive-500 focus:outline-none"
            aria-label="Prix maximum en TND"
          />
          <span className="ml-1 text-xs text-ink-400">TND</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="rounded-lg px-3 py-1.5 text-sm text-ink-500 transition-colors hover:text-terra-500"
          >
            ✕ Effacer
          </button>
        )}
      </div>
    </div>
  )
}
