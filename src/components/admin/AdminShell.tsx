'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { navigateWithLocale } from '@/utilities/navigation'
import { GROUPS } from './CollectionsList'
import { LocaleSwitcher } from './LocaleSwitcher'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter()
  const { locale } = useLocale()
  const [isMobile, setIsMobile] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = 'matches' in e ? e.matches : (e as MediaQueryList).matches
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    handler(mql)
    const listener = (ev: MediaQueryListEvent) => handler(ev)
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [])

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    navigateWithLocale(router, '/custom-admin', locale)
  }

  const handleCollectionClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault()
    navigateWithLocale(router, `/custom-admin/collections/${slug}`, locale)
  }

  return (
    <div
      className="custom-admin-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '260px 1fr',
        minHeight: '100vh',
      }}
    >
      {/* Sidebar */}
      <aside
        className="custom-admin-aside p-5"
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: sidebarOpen ? 0 : -280,
                width: 260,
                height: '100vh',
                transition: 'left 0.2s ease',
                zIndex: 40,
                overflowY: 'auto',
              }
            : undefined
        }
      >
        <a href="/custom-admin" className="custom-admin-link" onClick={handleBackClick}>
          ← Back
        </a>
        {Object.entries(GROUPS).map(([group, slugs]) => (
          <div key={group} className="mt-6">
            <div className="group-title text-xs uppercase tracking-wider opacity-80 mb-2">
              {group}
            </div>
            <nav style={{ display: 'grid', gap: 4 }}>
              {slugs.map((slug) => (
                <a
                  key={slug}
                  className="custom-admin-link"
                  href={`/custom-admin/collections/${slug}`}
                  onClick={(e) => handleCollectionClick(e, slug)}
                >
                  {slug
                    .split('-')
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ')}
                </a>
              ))}
            </nav>
          </div>
        ))}
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 30,
          }}
        />
      )}

      <main className="p-8 bg-slate-50" style={{ padding: isMobile ? '16px' : '32px' }}>
        <div className="max-w-screen-2xl mx-auto">
          <div
            className="flex items-center mb-4"
            style={{ justifyContent: isMobile ? 'space-between' : 'flex-end' }}
          >
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              style={{
                padding: '8px 10px',
                border: '1px solid #e5e7eb',
                background: '#fff',
                borderRadius: 8,
                cursor: 'pointer',
                alignItems: 'center',
                display: isMobile ? 'inline-flex' : 'none',
                gap: 8,
              }}
            >
              ☰ Menu
            </button>
            <LocaleSwitcher variant="links" align="right" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminShell
