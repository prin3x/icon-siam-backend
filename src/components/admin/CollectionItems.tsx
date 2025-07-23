'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { ViewModeToggle } from './ViewModeToggle'
import { ListView } from './ListView'
import { GridView } from './GridView'
import { TableView } from './TableView'
import { RecordDetailModal } from './RecordDetailModal'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { LocaleSwitcher } from './LocaleSwitcher'

const API_URL = '/api'

interface CollectionItemsProps {
  slug: string
  onBack: () => void
}

interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function CollectionItems({ slug, onBack }: CollectionItemsProps) {
  const router = useRouter()
  const { locale } = useLocale()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('list')

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Modal state (only for preview)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string>('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset to first page when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [debouncedSearchTerm])

  const fetchItems = useCallback(
    async (signal: AbortSignal) => {
      if (!slug || slug === '') {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        locale,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm)
      }

      try {
        const response = await fetch(`${API_URL}/custom-admin/${slug}?${params}`, {
          signal,
          headers: getApiHeaders(!isInternalRequest()),
        })

        console.log('Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text()
          console.error('Non-JSON response:', text)
          throw new Error(`Expected JSON but got: ${contentType}`)
        }

        const data = await response.json()
        console.log('Success response:', data)

        setItems(data.docs || [])
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages || 1,
          totalDocs: data.totalDocs || 0,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
        }))
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching items:', error)
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    },
    [slug, locale, debouncedSearchTerm, pagination.page, pagination.limit],
  )

  // Combined effect for all data fetching
  useEffect(() => {
    const controller = new AbortController()
    fetchItems(controller.signal)
    return () => controller.abort()
  }, [fetchItems])

  const handleEdit = (id: string) => {
    router.push(`/custom-admin/collections/${slug}/edit/${id}`)
  }

  const handleCreate = () => {
    router.push(`/custom-admin/collections/${slug}/create`)
  }

  const handlePreview = (id: string) => {
    setSelectedRecordId(id)
    setIsPreviewModalOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log('Delete item:', id)
    // Implement delete functionality
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }))
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setSelectedRecordId('')
  }

  const handleCreateSuccess = () => {
    // Refresh the items list after successful creation
    const controller = new AbortController()
    fetchItems(controller.signal)
  }

  // Show loading state
  if (loading) {
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
  }

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
    <>
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
              {pagination.totalDocs} items
            </span>
            <button
              onClick={handleCreate}
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

        <div className="mb-6">
          <LocaleSwitcher />
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

        {/* Search Bar */}
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  color: '#9ca3af',
                  fontSize: '16px',
                }}
              >
                🔍
              </div>
              {loading && (
                <div
                  style={{
                    position: 'absolute',
                    right: '16px',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Items per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Show:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

        {/* Results Section with Search Loading */}
        <div style={{ position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Searching...
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <ListView
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          )}
          {viewMode === 'grid' && (
            <GridView
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          )}
          {viewMode === 'table' && (
            <TableView
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
            />
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of{' '}
              {pagination.totalDocs} items
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: pagination.hasPrevPage ? '#ffffff' : '#f9fafb',
                  color: pagination.hasPrevPage ? '#374151' : '#9ca3af',
                  cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasPrevPage) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.hasPrevPage) {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  const isCurrentPage = pageNum === pagination.page

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: isCurrentPage ? '#3b82f6' : '#ffffff',
                        color: isCurrentPage ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        minWidth: '40px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentPage) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                          e.currentTarget.style.borderColor = '#9ca3af'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentPage) {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.borderColor = '#d1d5db'
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: pagination.hasNextPage ? '#ffffff' : '#f9fafb',
                  color: pagination.hasNextPage ? '#374151' : '#9ca3af',
                  cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasNextPage) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                    e.currentTarget.style.borderColor = '#9ca3af'
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.hasNextPage) {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.borderColor = '#d1d5db'
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Detail Modal (Preview Only) */}
      <RecordDetailModal
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        recordId={selectedRecordId}
        collectionSlug={slug}
        locale={locale}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
