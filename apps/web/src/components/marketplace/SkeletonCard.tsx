export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-cream-200 bg-white p-4">
      <div className="mb-3 h-36 rounded-lg bg-cream-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-cream-200" />
      <div className="mb-3 h-3 w-1/2 rounded bg-cream-100" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded bg-cream-200" />
        <div className="h-5 w-16 rounded bg-cream-100" />
      </div>
    </div>
  )
}
