'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/context'

export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''
  const { t } = useTranslation()

  const categories = [
    { value: '', label: t.marketplace.filters.all },
    { value: 'vegetables', label: t.marketplace.filters.vegetables },
    { value: 'fruit', label: t.marketplace.filters.fruit },
    { value: 'eggs', label: t.marketplace.filters.eggs },
    { value: 'honey', label: t.marketplace.filters.honey },
    { value: 'olive_oil', label: t.marketplace.filters.olive_oil },
    { value: 'legumes', label: t.marketplace.filters.legumes },
    { value: 'grains', label: t.marketplace.filters.grains },
    { value: 'herbs', label: t.marketplace.filters.herbs },
  ]

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`/marketplace?${params.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            currentCategory === cat.value
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
