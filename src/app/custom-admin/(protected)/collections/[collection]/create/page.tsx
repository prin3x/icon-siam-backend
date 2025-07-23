'use client'

import { LocaleProvider } from '@/components/admin/LocaleContext'
import { LocaleSwitcher } from '@/components/admin/LocaleSwitcher'
import { RecordEditForm } from '@/components/admin/RecordEditForm'
import { useRouter } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

interface RecordCreatePageProps {
  params: Promise<{
    collection: string
  }>
}

export default function RecordCreatePage({ params }: RecordCreatePageProps) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = React.useState<{
    collection: string
  } | null>(null)

  React.useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return <div>Loading...</div>
  }

  const handleBack = (path: string) => {
    // This will be handled by the browser back button or Link navigation
    router.push(path)
  }
  return (
    <LocaleProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="mb-4">
              <button
                onClick={() => handleBack(`/custom-admin/collections/${resolvedParams.collection}`)}
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
                ← Back to {resolvedParams.collection}
              </button>
            </div>
            <div className="mb-6">
              <LocaleSwitcher />
            </div>
            <div className="bg-white shadow rounded-lg">
              <RecordEditForm collectionSlug={resolvedParams.collection} />
            </div>
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}
