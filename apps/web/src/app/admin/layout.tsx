'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/trips', label: 'Trajets' },
  { href: '/admin/farmers', label: 'Agriculteurs' },
  { href: '/admin/drivers', label: 'Chauffeurs' },
  { href: '/admin/inventory', label: 'Inventaire' },
  { href: '/admin/disputes', label: 'Litiges' },
  { href: '/admin/ledger', label: 'Comptabilité' },
  { href: '/admin/whatsapp', label: 'WhatsApp' },
  { href: '/admin/payouts', label: 'Paiements D17' },
  { href: '/admin/zones', label: 'Zones' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100vh-4rem)] sm:-mx-6">
      <aside className="hidden w-56 shrink-0 border-r border-cream-200 bg-cream-50 p-4 lg:block">
        <Link href="/admin" className="mb-6 block font-display text-lg font-bold tracking-tight text-olive-900">
          Filahi Admin
        </Link>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-olive-700 font-medium text-white'
                    : 'text-ink-600 hover:bg-cream-100 hover:text-ink-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-x-auto bg-cream-50 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
