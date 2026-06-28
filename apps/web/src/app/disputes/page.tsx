'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DISPUTE_TYPES = [
  { key: 'cargo_theft', label: 'Vol de cargaison' },
  { key: 'otp_failure', label: 'Échec OTP' },
  { key: 'gps_loss', label: 'Perte GPS' },
  { key: 'quality_issue', label: 'Problème de qualité' },
  { key: 'no_show', label: 'Absence du chauffeur' },
  { key: 'other', label: 'Autre' },
]

export default function DisputeFormPage() {
  const router = useRouter()
  const [tripId, setTripId] = useState('')
  const [disputeType, setDisputeType] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId || !disputeType) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, disputeType, description }),
      })

      if (res.ok) {
        router.push('/orders')
      } else {
        const body = await res.json()
        setError(body.error || 'Erreur lors de la création du litige')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Signaler un problème</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tripId" className="mb-1 block text-sm font-medium text-gray-700">
            ID du trajet
          </label>
          <input
            id="tripId"
            type="text"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Type de problème
          </label>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de problème">
            {DISPUTE_TYPES.map((dt) => (
              <button
                key={dt.key}
                type="button"
                role="radio"
                aria-checked={disputeType === dt.key}
                onClick={() => setDisputeType(dt.key)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  disputeType === dt.key
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            rows={4}
            maxLength={2000}
            aria-required="false"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !tripId || !disputeType}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? 'Envoi...' : 'Signaler le problème'}
        </button>
      </form>
    </div>
  )
}
