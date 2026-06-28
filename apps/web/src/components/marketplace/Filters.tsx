'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = [
  { value: '', label: 'Toutes' },
  { value: 'vegetables', label: 'Légumes' },
  { value: 'fruit', label: 'Fruits' },
  { value: 'eggs', label: 'Œufs' },
  { value: 'honey', label: 'Miel' },
  { value: 'olive_oil', label: "Huile d'olive" },
  { value: 'legumes', label: 'Légumineuses' },
  { value: 'grains', label: 'Céréales' },
  { value: 'herbs', label: 'Herbes' },
]

export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''

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
      {CATEGORIES.map((cat) => (
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
