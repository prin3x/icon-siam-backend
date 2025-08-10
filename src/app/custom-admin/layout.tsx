import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Custom Admin Console',
  description: 'Custom admin interface for Payload CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-100">
        {/* Disable back-forward cache for custom admin to avoid stale UI in dev */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });
}`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
