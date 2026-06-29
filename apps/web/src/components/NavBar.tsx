'use client'

import Link from 'next/link'
import { Logo } from './Logo'
import { LangSwitcher } from './LangSwitcher'
import { useTranslation } from '@/lib/i18n/context'
import { useCart } from '@/lib/cart-context'

export function NavBar() {
  const { t } = useTranslation()
  const { itemCount } = useCart()

  return (
    <nav className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-2.5 sm:px-6">
        <Logo />

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/marketplace" className="btn-ghost text-xs sm:text-sm">
            {t.nav.marketplace}
          </Link>
          <Link href="/group-buys" className="btn-ghost text-xs sm:text-sm">
            {t.nav.groupBuys}
          </Link>
          <Link href="/b2b" className="btn-ghost text-xs sm:text-sm">
            {t.nav.b2b}
          </Link>
          <Link href="/how-it-works" className="btn-ghost text-xs sm:text-sm">
            {t.nav.howItWorks}
          </Link>
          <Link href="/orders" className="btn-ghost text-xs sm:text-sm">
            {t.nav.orders}
          </Link>
          <Link href="/profile" className="btn-ghost text-xs sm:text-sm">
            {t.nav.profile}
          </Link>
          <Link href="/cart" aria-label="Panier" className="relative ml-2 flex items-center gap-1 rounded-full border border-cream-200 px-3 py-1.5 text-xs transition-colors hover:border-olive-400 hover:text-olive-700 sm:text-sm">
            🛒
            {itemCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-olive-700 px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <Link href="/login" className="btn-primary ml-2 text-xs sm:text-sm">
            {t.nav.login}
          </Link>
          <LangSwitcher />
        </div>
      </div>
    </nav>
  )
}
