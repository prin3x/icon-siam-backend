'use client'

// src/components/admin/LocaleContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const supportedLocales = [
  { code: 'en', label: 'English' },
  { code: 'th', label: 'ไทย' },
  { code: 'zh', label: '中文' },
]

const LocaleContext = createContext<{
  locale: string
  setLocale: (locale: string) => void
  supported: typeof supportedLocales
}>({
  locale: 'en',
  setLocale: () => {},
  supported: supportedLocales,
})

export const useLocale = () => useContext(LocaleContext)

function getInitialLocale() {
  // 1. Try localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin-locale')
    if (stored && supportedLocales.some((l) => l.code === stored)) return stored
  }
  // 2. Try cookie
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^| )admin-locale=([^;]+)/)
    if (match && supportedLocales.some((l) => l.code === match[2])) return match[2]
  }
  // 3. Fallback
  return 'en'
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [locale, setLocaleState] = useState(() => {
    // First try to get from URL search params
    const urlLocale = searchParams.get('locale')
    if (urlLocale && supportedLocales.some((l) => l.code === urlLocale)) {
      return urlLocale
    }
    return getInitialLocale()
  })

  // Update locale when URL search params change
  useEffect(() => {
    const urlLocale = searchParams.get('locale')
    if (urlLocale && supportedLocales.some((l) => l.code === urlLocale) && urlLocale !== locale) {
      setLocaleState(urlLocale)
    }
  }, [searchParams, locale])

  // Persist to localStorage and cookie on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-locale', locale)
    }
    if (typeof document !== 'undefined') {
      document.cookie = `admin-locale=${locale}; path=/; max-age=31536000`
    }
  }, [locale])

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale)
    // Update URL with new locale
    const url = new URL(window.location.href)
    url.searchParams.set('locale', newLocale)
    router.replace(url.pathname + url.search)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, supported: supportedLocales }}>
      {children}
    </LocaleContext.Provider>
  )
}
