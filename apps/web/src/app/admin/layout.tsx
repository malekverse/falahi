import Link from 'next/link'
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
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 border-r border-gray-200 bg-white p-4">
        <Link href="/admin" className="mb-6 block text-lg font-bold text-green-700">
          Filahi Admin
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
