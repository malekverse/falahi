'use client'

import Link from 'next/link'
import { Logo } from './Logo'
import { LangSwitcher } from './LangSwitcher'
import { useTranslation } from '@/lib/i18n/context'

export function NavBar() {
  const { t } = useTranslation()

  return (
    <nav className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-2.5 sm:px-6">
        <Logo />

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
