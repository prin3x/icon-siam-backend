'use client'

import React from 'react'
import { LocaleProvider } from '@/components/admin/LocaleContext'
import { CollectionsList } from '@/components/admin/CollectionsList'

export default function AdminPage() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">ICONSIAM Collection</h1>
      </div>
      <CollectionsList />
    </div>
  )
}
