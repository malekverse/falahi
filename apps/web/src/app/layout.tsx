import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import './globals.css'
import { Providers } from './providers'
import { NavBar } from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Filahi - سوق الفلاحين',
  description: 'Tunisian farmer-to-buyer marketplace',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Filahi',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <NavBar />
          {children}
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-4">
              <Link href="/privacy" className="hover:text-green-600">Confidentialité</Link>
              <Link href="/terms" className="hover:text-green-600">Conditions</Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
