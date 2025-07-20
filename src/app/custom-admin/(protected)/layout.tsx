import React from 'react'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utilities/getMeUser'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getMeUser({
    nullUserRedirect: '/custom-admin/login',
  })

  if (!user) {
    return null
  }

  return <>{children}</>
}
