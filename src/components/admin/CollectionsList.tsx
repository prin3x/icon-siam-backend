import React from 'react'
import { useRouter } from 'next/navigation'

export const GROUPS: Record<string, string[]> = {
  'ICONSIAM Collection': [
    'homepage',
    'page-banners',
    'events',
    'shops',
    'dinings',
    'attractions',
    'icon-craft',
    'icon-luxe',
    'getting-here',
    'directory',
    'floors',
    'users',
    'categories',
    'gallery-collections',
    'promotions',
    'footers',
    'stickbar',
    'api-sync-logs',
    'facilities',
    'about-iconsiam',
    'board-of-directors',
    'iconsiam-awards',
    'vision-mission',
    'residences',
  ],
  'Images & Videos': ['media'],
}

interface CollectionsListProps {
  onSelect?: (slug: string) => void
}

export function CollectionsList({ onSelect }: CollectionsListProps) {
  const router = useRouter()

  const renderCard = (slug: string) => (
    <button
      key={slug}
      onClick={() => {
        if (onSelect) onSelect(slug)
        else router.push(`/custom-admin/collections/${slug}`)
      }}
      className="gold-card"
      style={{
        padding: '18px 18px',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      <span className="gold-plus">+</span>
      <span style={{ fontWeight: 600, color: '#3f3f46' }}>{formatSlugToTitle(slug)}</span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {Object.entries(GROUPS).map(([group, slugs]) => (
        <section key={group}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>
            {group}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            {slugs.map(renderCard)}
          </div>
        </section>
      ))}
    </div>
  )
}

function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}
