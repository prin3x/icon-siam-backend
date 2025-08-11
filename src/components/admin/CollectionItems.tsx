'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { navigateWithLocale } from '@/utilities/navigation'
import { ListView } from './ListView'
import { GridView } from './GridView'
import { TableView } from './TableView'
import { RecordDetailModal } from './RecordDetailModal'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'

const API_URL = '/api'

interface CollectionItemsProps {
  slug: string
  onBack: () => void
  hideHeaderControls?: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function CollectionItems({
  slug,
  onBack,
  hideHeaderControls = false,
}: CollectionItemsProps) {
  const router = useRouter()
  const { locale } = useLocale()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('table')
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [availableColumns, setAvailableColumns] = useState<Array<{ key: string; label: string }>>([
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ])
  const [filters, setFilters] = useState<Record<string, string | null>>({})
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const columnsRef = useRef<HTMLDivElement | null>(null)
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [schemaFields, setSchemaFields] = useState<
    Array<{
      name: string
      label: string
      type: string
      options?: Array<{ label: string; value: string }>
    }>
  >([])
  type FilterCondition = { field: string; operator: string; value: string }
  const [editingFilters, setEditingFilters] = useState<FilterCondition[]>([])
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([])

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string>('')
  const [deleteError, setDeleteError] = useState<string>('')
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false)

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

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [filters, appliedFilters])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (showColumnsDropdown && columnsRef.current && !columnsRef.current.contains(target)) {
        setShowColumnsDropdown(false)
      }
      // Do not auto-close filter panel; it's inline below
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [showColumnsDropdown])

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
        sort: '-updatedAt',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      // Text search across common fields using where[or]
      let orIndex = 0
      if (debouncedSearchTerm) {
        params.append(`where[or][${orIndex++}][title][like]`, debouncedSearchTerm)
        params.append(`where[or][${orIndex++}][subtitle][like]`, debouncedSearchTerm)
        params.append(`where[or][${orIndex++}][description][like]`, debouncedSearchTerm)
      }

      // Advanced builder: each row is appended as an OR condition
      const opMap: Record<string, string> = {
        equals: 'equals',
        contains: 'like',
        greater_than: 'greater_than',
        less_than: 'less_than',
        not_equals: 'not_equals',
        in: 'in',
        not_in: 'not_in',
      }
      appliedFilters.forEach((cond) => {
        if (!cond.field || !cond.operator) return
        const operator = opMap[cond.operator] || 'equals'
        const value =
          operator === 'in' || operator === 'not_in'
            ? cond.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : cond.value
        params.append(`where[or][${orIndex++}][${cond.field}][${operator}]`, String(value))
      })

      try {
        const response = await fetch(`${API_URL}/custom-admin/${slug}?${params}`, {
          signal,
          headers: getApiHeaders(!isInternalRequest()),
        })

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

        setItems(data.docs || [])
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages || 1,
          totalDocs: data.totalDocs || 0,
          hasNextPage: data.hasNextPage || false,
          hasPrevPage: data.hasPrevPage || false,
        }))
        // Derive available columns from payload response if present
        const docSample = (data.docs && data.docs[0]) || {}
        const inferredKeys = Object.keys(docSample)
          .filter((k) => !['id', 'updatedAt', '_status'].includes(k))
          .slice(0, 10)
        const inferred = inferredKeys.map((k) => ({
          key: k,
          label: k === 'createdAt' ? 'Created' : k.charAt(0).toUpperCase() + k.slice(1),
        }))
        // Fallback to admin defaultColumns from schema endpoint
        try {
          const schemaRes = await fetch(`/api/admin/${slug}?schema=true&locale=${locale}`, {
            signal,
          })
          if (schemaRes.ok) {
            const schemaJson = await schemaRes.json()
            const defaults: string[] = schemaJson?.admin?.defaultColumns || []
            const fieldsFromSchema: Array<{
              name: string
              label: string
              type: string
              options?: Array<{ label: string; value: string }>
            }> = (schemaJson?.fields || []).map((f: any) => ({
              name: f.name,
              label: f.label || f.name,
              type: f.type,
              options: f.options,
            }))
            setSchemaFields(fieldsFromSchema)
            const fromDefaults = defaults.map((k: string) => ({
              key: k,
              label: k.charAt(0).toUpperCase() + k.slice(1),
            }))
            const merged = Array.from(
              new Map([...fromDefaults, ...inferred].map((o) => [o.key, o])).values(),
            )
            if (merged.length > 0) setAvailableColumns(merged)
            if (defaults.length > 0) {
              setVisibleColumns((prev) => (prev.length ? prev : defaults))
            }
          } else if (inferred.length > 0) {
            setAvailableColumns(inferred)
          }
        } catch (_) {
          if (inferred.length > 0) setAvailableColumns(inferred)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching items:', error)
          setError(error.message)
        }
      } finally {
        setLoading(false)
      }
    },
    [slug, locale, debouncedSearchTerm, pagination.page, pagination.limit, filters, appliedFilters],
  )

  // Combined effect for all data fetching
  useEffect(() => {
    const controller = new AbortController()
    fetchItems(controller.signal)
    return () => controller.abort()
  }, [fetchItems])

  const handleEdit = (id: string) => {
    navigateWithLocale(router, `/custom-admin/collections/${slug}/edit/${id}`, locale)
  }

  const handleCreate = () => {
    navigateWithLocale(router, `/custom-admin/collections/${slug}/create`, locale)
  }

  const handlePreview = (id: string) => {
    setSelectedRecordId(id)
    setIsPreviewModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setDeleteError('')
    setIsDeleteModalOpen(true)
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

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    try {
      setDeleteLoading(true)
      setDeleteError('')
      const res = await fetch(`/api/custom-admin/${slug}/${deletingId}?locale=${locale}`, {
        method: 'DELETE',
        headers: getApiHeaders(!isInternalRequest()),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to delete')
      }
      setIsDeleteModalOpen(false)
      setDeletingId('')
      // refresh list
      const controller = new AbortController()
      fetchItems(controller.signal)
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
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
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {!hideHeaderControls && (
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
        )}

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
                  border: '1px solid var(--brand-gold)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-gold)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(201, 162, 39, 0.12)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--brand-gold)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  color: 'var(--brand-gold)',
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

          {/* Column and Filter buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Columns dropdown */}
            <div style={{ position: 'relative' }} ref={columnsRef}>
              <button
                type="button"
                onClick={() => setShowColumnsDropdown((v) => !v)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Column ▾
              </button>
              {showColumnsDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 8,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: 12,
                    minWidth: 220,
                    zIndex: 20,
                  }}
                >
                  {availableColumns.map((col) => (
                    <label key={col.key} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={(e) => {
                          setVisibleColumns((prev) =>
                            e.target.checked
                              ? Array.from(new Set([...prev, col.key]))
                              : prev.filter((k) => k !== col.key),
                          )
                        }}
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filter builder toggle */}
            <div style={{ position: 'relative' }} ref={filtersRef}>
              <button
                type="button"
                onClick={() => setShowFilterPanel((v) => !v)}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Filter ▾
              </button>
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
                border: '1px solid var(--brand-gold)',
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

        {/* Filter builder panel */}
        {showFilterPanel && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 10 }}>Add new filter</div>
            {editingFilters.map((cond, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1.4fr auto',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <select
                  value={cond.field}
                  onChange={(e) =>
                    setEditingFilters((arr) =>
                      arr.map((c, i) => (i === idx ? { ...c, field: e.target.value } : c)),
                    )
                  }
                  style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: 10 }}
                >
                  <option value="">Select field</option>
                  {schemaFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <select
                  value={cond.operator}
                  onChange={(e) =>
                    setEditingFilters((arr) =>
                      arr.map((c, i) => (i === idx ? { ...c, operator: e.target.value } : c)),
                    )
                  }
                  style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: 10 }}
                >
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="greater_than">greater than</option>
                  <option value="less_than">less than</option>
                  <option value="not_equals">not equals</option>
                  <option value="in">in (comma separated)</option>
                  <option value="not_in">not in (comma separated)</option>
                </select>
                <input
                  value={cond.value}
                  onChange={(e) =>
                    setEditingFilters((arr) =>
                      arr.map((c, i) => (i === idx ? { ...c, value: e.target.value } : c)),
                    )
                  }
                  placeholder="Enter a value"
                  style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: 10 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setEditingFilters((arr) => arr.filter((_, i) => i !== idx))}
                    className="admin-button"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingFilters((arr) => [
                        ...arr.slice(0, idx + 1),
                        { field: '', operator: 'equals', value: '' },
                        ...arr.slice(idx + 1),
                      ])
                    }
                    className="admin-button"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() =>
                  setEditingFilters((arr) => [...arr, { field: '', operator: 'equals', value: '' }])
                }
                className="admin-button"
              >
                + Add Or
              </button>
              <button
                type="button"
                className="admin-button-primary"
                onClick={() => setAppliedFilters(editingFilters)}
              >
                Apply
              </button>
              <button
                type="button"
                className="admin-button"
                onClick={() => {
                  setEditingFilters([])
                  setAppliedFilters([])
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Chips row (click to remove column) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {visibleColumns.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setVisibleColumns((prev) => prev.filter((k) => k !== key))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setVisibleColumns((prev) => prev.filter((k) => k !== key))
                }
              }}
              title={`Remove column ${key}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                border: '1px solid var(--brand-gold)',
                background: '#fff',
                color: '#6b5b2a',
                borderRadius: 8,
                fontSize: 12,
                textTransform: 'none',
                cursor: 'pointer',
              }}
            >
              × {key}
            </button>
          ))}
        </div>

        {/* Hide view toggle for the table-like look */}
        {/* <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} /> */}

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
              columns={visibleColumns.map((k) => ({
                key: k,
                label: k === 'createdAt' ? 'Created' : k[0].toUpperCase() + k.slice(1),
                type: k === 'status' ? 'status' : k === 'createdAt' ? 'date' : 'text',
              }))}
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
                {(() => {
                  const windowSize = 5
                  const half = Math.floor(windowSize / 2)
                  const total = Math.max(1, pagination.totalPages)
                  let start = Math.max(1, pagination.page - half)
                  const end = Math.min(total, start + windowSize - 1)
                  start = Math.max(1, end - windowSize + 1)
                  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
                  return pages.map((pageNum) => {
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
                  })
                })()}
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false)
          }}
        >
          <div
            className="admin-card"
            style={{ width: 420, padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold" style={{ marginBottom: 10 }}>
              Confirm deletion
            </h3>
            <p className="text-sm" style={{ color: '#6b7280', marginBottom: 12 }}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            {deleteError && (
              <div
                style={{
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="admin-button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ef4444',
                  borderRadius: 8,
                  background: deleteLoading ? '#fee2e2' : '#ffffff',
                  color: '#ef4444',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
