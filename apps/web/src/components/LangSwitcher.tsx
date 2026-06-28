'use client'

import { useTranslation } from '@/lib/i18n/context'

export function LangSwitcher() {
  const { lang, toggleLang } = useTranslation()

  return (
    <button
      onClick={toggleLang}
      className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
    >
      {lang === 'fr' ? 'العربية' : 'Français'}
    </button>
  )
}
