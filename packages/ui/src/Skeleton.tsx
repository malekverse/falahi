'use client'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <Skeleton className="mb-3 h-40 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}><Skeleton className="h-12 w-full" /></div>
      ))}
    </div>
  )
}
