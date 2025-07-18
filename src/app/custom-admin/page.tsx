'use client'

import React, { useState, useEffect } from 'react'
import { LocaleProvider } from '@/components/admin/LocaleContext'
import { LocaleSwitcher } from '@/components/admin/LocaleSwitcher'
import { CollectionsList } from '@/components/admin/CollectionsList'
import { CollectionItems } from '@/components/admin/CollectionItems'

export default function AdminPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Console</h1>
            <p className="text-lg text-gray-600">Manage your content collections with ease</p>
          </div>

          {/* Locale Switcher */}
          <div className="mb-6">
            <LocaleSwitcher />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {selected ? (
              <CollectionItems slug={selected} onBack={() => setSelected(null)} />
            ) : (
              <CollectionsList onSelect={setSelected} />
            )}
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}
