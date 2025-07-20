'use client'

import { CollectionItems } from '@/components/admin/CollectionItems'
import { LocaleProvider } from '@/components/admin/LocaleContext'
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

  const handleBack = () => {
    // This will be handled by the browser back button or Link navigation
    router.push('/custom-admin')
  }

  return (
    <LocaleProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <CollectionItems slug={resolvedParams.collection} onBack={handleBack} />
          </div>
        </div>
      </div>
    </LocaleProvider>
  )
}
