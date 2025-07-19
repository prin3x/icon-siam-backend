import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLLECTIONS = [
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
  'news-press',
  'stories',
  'api-sync-logs',
]

interface CollectionsListProps {
  onSelect?: (slug: string) => void
}

export function CollectionsList({ onSelect }: CollectionsListProps) {
  const router = useRouter()

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '20px',
          marginTop: '0',
        }}
      >
        Collections
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}
      >
        {COLLECTIONS.map((slug) => (
          <button
            key={slug}
            onClick={() => {
              console.log('Collection selected:', slug)
              if (onSelect) {
                onSelect(slug)
              } else {
                router.push(`/custom-admin/collections/${slug}`)
              }
            }}
            style={{
              padding: '16px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontSize: '15px',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
              e.currentTarget.style.borderColor = '#3b82f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.borderColor = '#e5e7eb'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  textTransform: 'capitalize',
                  letterSpacing: '0.025em',
                }}
              >
                {slug.replace('-', ' ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
