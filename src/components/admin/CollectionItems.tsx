import React, { useEffect, useState } from 'react'
import { useLocale } from './LocaleContext'
import { ViewModeToggle } from './ViewModeToggle'
import { ListView } from './ListView'
import { GridView } from './GridView'
import { TableView } from './TableView'

const API_URL = '/api'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

interface CollectionItemsProps {
  slug: string
  onBack: () => void
}

export function CollectionItems({ slug, onBack }: CollectionItemsProps) {
  const { locale } = useLocale()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list')

  useEffect(() => {
    // Only fetch if we have a valid slug
    if (!slug || slug === '') {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    fetch(`${API_URL}/authenticated/${slug}?locale=${locale}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        console.log('Response status:', res.status)

        if (!res.ok) {
          const errorText = await res.text()
          console.error('Error response:', errorText)
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }

        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text()
          console.error('Non-JSON response:', text)
          throw new Error(`Expected JSON but got: ${contentType}`)
        }

        return res.json()
      })
      .then((data) => {
        console.log('Success response:', data)
        setItems(data.docs || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching items:', error)
        setError(error.message)
        setLoading(false)
      })
  }, [slug, locale])

  const handleEdit = (id: string) => {
    console.log('Edit item:', id)
    // Implement edit functionality
  }

  const handleDelete = (id: string) => {
    console.log('Delete item:', id)
    // Implement delete functionality
  }

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '16px',
          color: '#6b7280',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          Loading items...
        </div>
      </div>
    )

  if (error)
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          fontSize: '14px',
        }}
      >
        Error: {error}
      </div>
    )

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb'
            e.currentTarget.style.borderColor = '#9ca3af'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.borderColor = '#d1d5db'
          }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            {items.length} items
          </span>
          <button
            style={{
              padding: '10px 20px',
              border: '1px solid #10b981',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
              e.currentTarget.style.color = '#10b981'
            }}
          >
            + Add New
          </button>
        </div>
      </div>

      <h3
        style={{
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
        }}
      >
        {slug.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (locale: {locale})
      </h3>

      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === 'list' && (
        <ListView items={items} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {viewMode === 'grid' && (
        <GridView items={items} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {viewMode === 'table' && (
        <TableView items={items} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
