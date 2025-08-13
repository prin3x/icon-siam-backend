import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { navigateWithLocale } from '@/utilities/navigation'

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
    'stories',
  ],
  'Images & Videos': ['media'],
}

// Display name overrides for specific slugs to match the design copy exactly
const TITLE_OVERRIDES: Record<string, string> = {
  'page-banners': 'Page Banners',
  'icon-craft': 'Icon Crafts',
  'icon-luxe': 'Icon Luxes',
  'getting-here': 'Getting Here',
  directory: 'Directories',
  floors: 'Floors',
  users: 'Users',
  categories: 'Categories',
  'gallery-collections': 'Gallery Collections',
  promotions: 'Promotions',
  footers: 'Footers',
  stickbar: 'Stickbars',
  'api-sync-logs': 'API Sync Logs',
  facilities: 'Facilities',
  'about-iconsiam': 'About Iconsiam',
  'board-of-directors': 'Board of Directors',
  'iconsiam-awards': 'Iconsiam Awards',
  'vision-mission': 'Vision and mission',
  residences: 'Residences',
  stories: 'Stories',
  media: 'Media',
}

interface CollectionsListProps {
  onSelect?: (slug: string) => void
}

export function CollectionsList({ onSelect }: CollectionsListProps) {
  const router = useRouter()
  const { locale } = useLocale()

  const renderCard = (slug: string) => (
    <button
      key={slug}
      onClick={() => {
        if (onSelect) onSelect(slug)
        else navigateWithLocale(router, `/custom-admin/collections/${slug}`, locale)
      }}
      className="gold-card"
      style={{
        padding: '18px 18px',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      <span className="gold-plus">+</span>
      <span
        style={{
          fontWeight: 600,
          color: 'var(--brand-sidebar)',
        }}
      >
        {formatSlugToTitle(slug)}
      </span>
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
              // Match the design: five cards per row at desktop widths
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
  if (TITLE_OVERRIDES[slug]) return TITLE_OVERRIDES[slug]

  const stopWords = new Set(['of', 'and', 'to', 'in', 'on', 'the', 'for'])
  const acronyms = new Set(['api', 'id', 'url'])

  return slug
    .split('-')
    .map((word, idx) => {
      const lower = word.toLowerCase()
      if (acronyms.has(lower)) return lower.toUpperCase()
      const title = lower.charAt(0).toUpperCase() + lower.slice(1)
      // Lowercase stop-words except when first word
      if (idx !== 0 && stopWords.has(lower)) return lower
      return title
    })
    .join(' ')
}
