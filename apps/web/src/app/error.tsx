'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="text-5xl">⚠️</span>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-ink-500">
        {error.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary mt-6"
      >
        Réessayer
      </button>
    </div>
  )
}
