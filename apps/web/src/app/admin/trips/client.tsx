'use client'

import dynamic from 'next/dynamic'

const LiveDriverMap = dynamic(
  () => import('@/components/map/LiveDriverMap').then((m) => m.LiveDriverMap),
  { ssr: false, loading: () => <div className="h-[500px] w-full animate-pulse rounded-lg bg-gray-200" /> },
)

interface DriverData {
  id: string
  lat: number
  lng: number
  label: string
}

interface TripData {
  id: string
  origin_location_name: string
  status: string
  driver_id: string | null
  created_at: string
  last_known_lat: number | null
  last_known_lng: number | null
}

export function AdminTripsClient({ drivers, trips }: { drivers: DriverData[]; trips: TripData[] }) {
  return (
    <div>
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          {drivers.length} chauffeur{drivers.length !== 1 ? 's' : ''} actif{drivers.length !== 1 ? 's' : ''}
        </span>
      </div>
      <LiveDriverMap
        drivers={drivers}
        onSignalLost={(id) => {
          const trip = trips.find((t) => t.id === id)
          if (!trip) return false
          const tenMinutesAgo = Date.now() - 10 * 60 * 1000
          return new Date(trip.created_at).getTime() < tenMinutesAgo
        }}
      />
    </div>
  )
}
