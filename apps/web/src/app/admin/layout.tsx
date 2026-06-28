'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: '⊞' },
  { href: '/admin/trips', label: 'Trajets', icon: '⊡' },
  { href: '/admin/farmers', label: 'Agriculteurs', icon: '⊟' },
  { href: '/admin/drivers', label: 'Chauffeurs', icon: '⊡' },
  { href: '/admin/inventory', label: 'Inventaire', icon: '⊞' },
  { href: '/admin/disputes', label: 'Litiges', icon: '⊟' },
  { href: '/admin/ledger', label: 'Comptabilité', icon: '⊡' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '⊞' },
  { href: '/admin/payouts', label: 'Paiements', icon: '⊟' },
  { href: '/admin/zones', label: 'Zones', icon: '⊡' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100vh-4rem)] sm:-mx-6">
      <aside className="hidden w-56 shrink-0 border-r border-cream-200 bg-cream-50 p-4 lg:block">
        <Link href="/admin" className="mb-6 flex items-center gap-2 font-display text-lg font-bold tracking-tight text-olive-900">
          <span className="text-gold-500">⏤</span>
          <span>فيلاحي</span>
          <span className="text-[10px] font-normal uppercase tracking-wider text-ink-400">Admin</span>
        </Link>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-olive-700 font-medium text-white shadow-sm'
                    : 'text-ink-600 hover:bg-cream-100 hover:text-ink-900'
                }`}
              >
                <span className={`w-4 text-center text-xs ${isActive ? 'text-olive-300' : 'text-ink-400'}`}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-6 border-t border-cream-200 pt-4">
          <Link href="/marketplace" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-400 transition-colors hover:text-olive-700">
            ← Retour au marché
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto bg-cream-50 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
