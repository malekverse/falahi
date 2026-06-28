import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'
import { Providers } from './providers'
import { NavBar } from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Filahi — سوق الفلاحين',
  description: 'Le marché des producteurs tunisiens. Produits frais, de la ferme à votre table.',
  manifest: '/manifest.json',
  themeColor: '#2d6a4f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Filahi',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <NavBar />
          <main className="mx-auto min-h-[calc(100vh-10rem)] max-w-app px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-cream-200 bg-cream-100 py-10">
            <div className="mx-auto flex max-w-app flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
              <Link href="/marketplace" className="font-display text-lg font-bold tracking-tight text-olive-900">
                Filahi
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/how-it-works" className="text-sm text-ink-500 transition-colors hover:text-olive-700">Comment ça marche</Link>
                <Link href="/privacy" className="text-sm text-ink-500 transition-colors hover:text-olive-700">Confidentialité</Link>
                <Link href="/terms" className="text-sm text-ink-500 transition-colors hover:text-olive-700">Conditions</Link>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-ink-500">
              &copy; {new Date().getFullYear()} Filahi — فلاحي. Tous droits réservés.
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
