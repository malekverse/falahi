import { CardSkeleton } from '@filahi/ui'

export default function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 h-9 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 flex gap-2">
        <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
