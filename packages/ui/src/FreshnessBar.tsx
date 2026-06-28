'use client'

interface FreshnessBarProps {
  harvestDate: string | null
  shelfLifeDays: number | null
}

export function FreshnessBar({ harvestDate, shelfLifeDays }: FreshnessBarProps) {
  if (!harvestDate || !shelfLifeDays) return null

  const harvest = new Date(harvestDate)
  const now = new Date()
  const elapsedDays = (now.getTime() - harvest.getTime()) / (1000 * 60 * 60 * 24)
  const ratio = Math.max(0, Math.min(1, elapsedDays / shelfLifeDays))

  const getColor = (r: number) => {
    if (r < 0.33) return 'bg-green-500'
    if (r < 0.66) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getLabel = (r: number) => {
    if (r < 0.33) return 'Très frais'
    if (r < 0.66) return 'Frais'
    return 'À consommer rapidement'
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{getLabel(ratio)}</span>
        <span>J-{Math.max(0, Math.round(shelfLifeDays - elapsedDays))}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(ratio)}`}
          style={{ width: `${(1 - ratio) * 100}%` }}
        />
      </div>
    </div>
  )
}
