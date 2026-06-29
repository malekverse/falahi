'use client'

import { useState } from 'react'
import { StarRating } from './StarRating'
import { createClient } from '@/lib/supabase/client'

interface RatingFormProps {
  orderId: string
  tripId?: string
  targetId: string
  targetType: 'driver' | 'farmer' | 'product'
  targetLabel: string
  onComplete?: () => void
}

export function RatingForm({ orderId, tripId, targetId, targetType, targetLabel, onComplete }: RatingFormProps) {
  const [score, setScore] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (score === 0) return
    setSubmitting(true)
    setError('')

    const { data: { session } } = await createClient().auth.getSession()
    if (!session) {
      setError('Connectez-vous pour noter')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        orderId,
        tripId,
        targetId,
        targetType,
        score,
        reviewText: reviewText || undefined,
      }),
    })

    if (res.ok) {
      setSubmitted(true)
      onComplete?.()
    } else {
      const err = await res.json()
      setError(err.error || 'Erreur lors de l\'envoi')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
        Merci ! Vous avez noté {targetLabel} {score}/5.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium">Noter {targetLabel}</p>
      <StarRating value={score} onChange={setScore} size="md" />

      <textarea
        aria-label="Commentaire (optionnel)"
        className="mb-2 mt-3 w-full rounded border border-gray-200 p-2 text-sm"
        rows={2}
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Commentaire (optionnel)"
        maxLength={1000}
      />

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <button
        className="rounded bg-amber-500 px-3 py-1 text-sm text-white disabled:opacity-50"
        onClick={handleSubmit}
        disabled={submitting || score === 0}
      >
        {submitting ? 'Envoi...' : `Noter ${score > 0 ? `(${score}/5)` : ''}`}
      </button>
    </div>
  )
}
