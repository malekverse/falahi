'use client'

interface FairPriceWidgetProps {
  askingPriceMillimes: number
  platformPriceMillimes: number | null
}

const GACHARA_DISCOUNT_RATE = 0.55

function formatTnd(millimes: number): string {
  return (millimes / 1000).toLocaleString('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }) + ' TND'
}

export function FairPriceWidget({ askingPriceMillimes, platformPriceMillimes }: FairPriceWidgetProps) {
  const marketPrice = platformPriceMillimes || Math.round(askingPriceMillimes * 1.12)
  const gacharaOffer = Math.round(askingPriceMillimes * (1 - GACHARA_DISCOUNT_RATE))
  const farmerGets = askingPriceMillimes
  const buyerSaves = marketPrice - askingPriceMillimes

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
      <p className="mb-1 font-medium text-amber-800">Prix équitable</p>
      <div className="space-y-0.5 text-amber-700">
        <p>L&apos;agriculteur reçoit <strong>{formatTnd(farmerGets)}</strong></p>
        <p>Gachara aurait offert ≈ <strong className="text-red-600">{formatTnd(gacharaOffer)}</strong></p>
        {buyerSaves > 0 && (
          <p>Vous économisez <strong className="text-green-600">{formatTnd(buyerSaves)}</strong></p>
        )}
      </div>
    </div>
  )
}
