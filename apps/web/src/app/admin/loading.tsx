import { Skeleton } from '@filahi/ui'

export default function AdminLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <Skeleton className="mb-2 h-2 w-12" />
            <Skeleton className="mb-1 h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
