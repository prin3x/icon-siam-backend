'use client'

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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6">
        <div className="shadow rounded-lg p-8">
          <RecordEditForm collectionSlug={resolvedParams.collection} />
        </div>
      </div>
    </div>
  )
}
