'use client'

import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function LoginPage() {
  const callbackUrl = '/api/auth/bridge'

  useEffect(() => {
    signIn('azure-ad', { callbackUrl })
  }, [callbackUrl])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Redirecting to Microsoft Login…</h1>
        <p className="text-gray-500 mb-2">
          Please wait while we redirect you to sign in with Microsoft.
        </p>
      </div>
    </div>
  )
}
