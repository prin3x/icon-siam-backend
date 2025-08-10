'use client'

import { CollectionItems } from '@/components/admin/CollectionItems'
import { LocaleSwitcher } from '@/components/admin/LocaleSwitcher'
import { useRouter } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

interface CollectionPageProps {
  params: Promise<{
    collection: string
  }>
}

export default function CollectionPage({ params }: CollectionPageProps) {
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

  const handleBack = () => router.push('/custom-admin')

  const goCreate = () =>
    router.push(`/custom-admin/collections/${resolvedParams.collection}/create`)

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-slate-500 mb-1">/ {resolvedParams.collection}</div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {resolvedParams.collection
              .split('-')
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ')}
            <a
              href="#"
              className="ml-3 text-sm font-medium text-blue-600 hover:underline align-middle"
              onClick={(e) => e.preventDefault()}
            >
              Preview
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goCreate}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--brand-gold)',
              background: '#fff',
              color: 'var(--brand-gold)',
              fontWeight: 600,
            }}
          >
            Create new
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200">
        <CollectionItems slug={resolvedParams.collection} onBack={handleBack} hideHeaderControls />
      </div>
    </div>
  )
}
