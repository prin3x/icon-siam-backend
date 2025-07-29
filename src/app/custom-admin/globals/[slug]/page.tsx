'use client'

import { LocaleProvider } from '@/components/admin/LocaleContext'
import { LocaleSwitcher } from '@/components/admin/LocaleSwitcher'
import { RecordEditForm } from '@/components/admin/RecordEditForm'
import { useRouter } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

interface GlobalEditPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function GlobalEditPage({ params }: GlobalEditPageProps) {
  const router = useRouter()
  const { slug } = await params

  if (!slug) {
    return <div>Loading...</div>
  }

  const handleBack = (path: string) => {
    router.push(path)
  }

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="mb-4">
              <button
                onClick={() => handleBack(`/custom-admin`)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            <div className="mb-6">
              <LocaleSwitcher />
            </div>
            <div className="bg-white shadow rounded-lg">
              <RecordEditForm globalSlug={slug} />
            </div>
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}
