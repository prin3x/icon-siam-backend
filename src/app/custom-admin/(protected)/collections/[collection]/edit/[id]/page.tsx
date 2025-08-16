'use client'

import { useLocale } from '@/components/admin/LocaleContext'
import { RecordEditForm } from '@/components/admin/RecordEditForm'
import { useRouter } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

interface RecordEditPageProps {
  params: Promise<{
    collection: string
    id: string
  }>
}

export default function RecordEditPage({ params }: RecordEditPageProps) {
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = React.useState<{
    collection: string
    id: string
  } | null>(null)
  const { locale } = useLocale()

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <RecordEditForm collectionSlug={resolvedParams.collection} recordId={resolvedParams.id} />
      </div>
    </div>
  )
}
