'use client'

import React from 'react'
import { GROUPS } from './CollectionsList'
import { LocaleSwitcher } from './LocaleSwitcher'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="custom-admin-shell">
      <aside className="custom-admin-aside p-5">
        <a href="/custom-admin" className="custom-admin-link">
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

      <main className="p-8 bg-slate-50">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-end mb-4">
            <LocaleSwitcher variant="links" align="right" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminShell
