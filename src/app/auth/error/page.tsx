'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const params = useSearchParams()
  const error = params.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Authentication Error</h1>
        <p className="text-gray-500 mb-2">
          {error || 'Something went wrong while signing you in.'}
        </p>
      </div>
    </div>
  )
}
