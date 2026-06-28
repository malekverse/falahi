'use client'

import { useState, useEffect, useCallback } from 'react'

interface StaleTrip {
  trip_id: string
  driver_name: string
  minutes_stale: number
}

export function StaleTripsAlert() {
  const [staleTrips, setStaleTrips] = useState<StaleTrip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStale = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stale-trips')
      if (res.ok) {
        const data = await res.json()
        setStaleTrips(data.trips ?? [])
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStale()
    const interval = setInterval(fetchStale, 60_000)
    return () => clearInterval(interval)
  }, [fetchStale])

  if (loading) return null

  if (staleTrips.length === 0) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <p className="font-medium text-red-800">
          {staleTrips.length} trajet{staleTrips.length > 1 ? 's' : ''} sans mise à jour GPS
        </p>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-red-700">
        {staleTrips.slice(0, 5).map((t) => (
          <li key={t.trip_id}>
            {t.driver_name} — {t.minutes_stale} min sans signal
          </li>
        ))}
      </ul>
    </div>
  )
}
