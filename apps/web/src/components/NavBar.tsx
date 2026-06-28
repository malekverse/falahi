'use client'

import Link from 'next/link'
import { LangSwitcher } from './LangSwitcher'
import { useTranslation } from '@/lib/i18n/context'

export function NavBar() {
  const { t } = useTranslation()

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <Link href="/marketplace" className="text-lg font-bold text-green-700">
        Filahi
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">
          {t.nav.marketplace}
        </Link>
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
          {t.nav.login}
        </Link>
        <LangSwitcher />
      </div>
    </nav>
  )
}
