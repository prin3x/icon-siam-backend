import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Custom Admin Console',
  description: 'Custom admin interface for Payload CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-100">{children}</body>
    </html>
  )
}
