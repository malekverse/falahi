'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
          <span className="text-5xl">⚠️</span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Une erreur critique est survenue</h1>
          <p className="mt-2 text-sm text-ink-500">
            Veuillez réessayer ou nous contacter si le problème persiste.
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn-primary mt-6"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
