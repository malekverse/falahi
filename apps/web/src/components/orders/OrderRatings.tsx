'use client'

import { RatingForm } from '@/components/ratings/RatingForm'

interface OrderRatingsProps {
  orderId: string
  tripId?: string
  farmerId: string
  farmerName: string
  driverId?: string
  driverName?: string
}

export function OrderRatings({ orderId, tripId, farmerId, farmerName, driverId, driverName }: OrderRatingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Noter votre commande</h2>

      <RatingForm
        orderId={orderId}
        tripId={tripId}
        targetId={farmerId}
        targetType="farmer"
        targetLabel={`l'agriculteur ${farmerName}`}
      />

      {driverId && driverName && (
        <RatingForm
          orderId={orderId}
          tripId={tripId}
          targetId={driverId}
          targetType="driver"
          targetLabel={`le chauffeur ${driverName}`}
        />
      )}
    </div>
  )
}
