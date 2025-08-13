'use client'

import React from 'react'
import { CollectionsList } from '@/components/admin/CollectionsList'

export default function AdminPage() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <CollectionsList />
    </div>
  )
}
