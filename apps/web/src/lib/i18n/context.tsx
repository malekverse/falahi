'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fr } from './fr'
import { ar } from './ar'
import type { Translations } from './types'

type Lang = 'fr' | 'ar'

const STORAGE_KEY = 'filahi_lang'

const translations: Record<Lang, Translations> = { fr, ar }

interface I18nContextValue {
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === 'fr' || stored === 'ar') {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'fr' ? 'ar' : 'fr')
  }, [lang, setLang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return { lang: 'fr', t: fr, setLang: () => {}, toggleLang: () => {} }
  }
  return ctx
}
