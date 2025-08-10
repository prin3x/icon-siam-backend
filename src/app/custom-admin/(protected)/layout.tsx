import React from 'react'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utilities/getMeUser'
import AdminShell from '@/components/admin/AdminShell'
import { LocaleProvider } from '@/components/admin/LocaleContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getMeUser({
    nullUserRedirect: '/custom-admin/login',
  })

  if (!user) {
    return null
  }

  return (
    <LocaleProvider>
      <AdminShell>{children}</AdminShell>
    </LocaleProvider>
  )
}
