export const metadata = {
  title: 'ICONSIAM CMS',
  description: 'ICONSIAM CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
