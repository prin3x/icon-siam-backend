'use client'

// src/components/admin/LocaleContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

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
  const [locale, setLocaleState] = useState(getInitialLocale)

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
    // Persistence is handled by useEffect
    // Force a re-render across app/router boundaries by replacing the URL without navigation
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('locale', newLocale)
      window.history.replaceState(null, '', url.toString())
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, supported: supportedLocales }}>
      {children}
    </LocaleContext.Provider>
  )
}
