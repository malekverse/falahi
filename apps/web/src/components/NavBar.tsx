'use client'

import Link from 'next/link'
import { LangSwitcher } from './LangSwitcher'
import { useTranslation } from '@/lib/i18n/context'

export function NavBar() {
  const { t } = useTranslation()

  return (
    <nav className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/marketplace" className="font-display text-xl font-bold tracking-tight text-olive-900">
          Filahi
          <span className="ml-1 text-gold-500">⏤</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/marketplace" className="btn-ghost text-xs sm:text-sm">
            {t.nav.marketplace}
          </Link>
          <Link href="/how-it-works" className="btn-ghost text-xs sm:text-sm">
            {t.nav.howItWorks}
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
