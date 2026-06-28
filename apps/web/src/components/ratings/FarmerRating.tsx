'use client'

import { useState } from 'react'
import { StarRating } from './StarRating'

interface FarmerRatingProps {
  orderId: string
  tripId: string | null
  farmerId: string
  onRated: () => void
}

export function FarmerRating({ orderId, tripId, farmerId, onRated }: FarmerRatingProps) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleRate(score: number) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          tripId,
          targetId: farmerId,
          targetType: 'farmer',
          score,
        }),
      })
      if (res.ok) {
        setDone(true)
        onRated()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return     <p className="text-sm text-green-600">Merci d&apos;avoir évalué l&apos;agriculteur !</p>
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-medium text-gray-700">Qualité des produits</h4>
      <StarRating
        value={0}
        onChange={handleRate}
        readonly={submitting}
      />
    </div>
  )
}
