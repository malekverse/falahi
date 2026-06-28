import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="text-5xl">🔍</span>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Page introuvable</h1>
      <p className="mt-2 text-sm text-ink-500">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-6 flex items-center gap-4">
        <Link href="/marketplace" className="btn-primary">
          Voir le marché
        </Link>
        <Link href="/" className="btn-ghost">
          Accueil
        </Link>
      </div>
    </div>
  )
}
