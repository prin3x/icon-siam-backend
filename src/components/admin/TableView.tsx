import React from 'react'
import * as Switch from '@radix-ui/react-switch'
import { EyeOpenIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons'

type ColumnDef = {
  key: string
  label: string
  type?: 'text' | 'status' | 'date'
}

interface TableViewProps {
  items: any[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPreview: (id: string) => void
  columns?: ColumnDef[]
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (key: string, order: 'asc' | 'desc') => void
  onToggleField?: (id: string, field: string, value: any) => void
  loading?: boolean
  skeletonRowCount?: number
}

const defaultColumns: ColumnDef[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'createdAt', label: 'Created', type: 'date' },
]

export function TableView({
  items,
  onEdit,
  onDelete,
  onPreview,
  columns = defaultColumns,
  sortKey,
  sortOrder,
  onSortChange,
  onToggleField,
  loading = false,
  skeletonRowCount = 8,
}: TableViewProps) {
  const IconEye = ({ size = 20 }: { size?: number }) => <EyeOpenIcon width={size} height={size} />

  const IconPencil = ({ size = 20 }: { size?: number }) => (
    <Pencil2Icon width={size} height={size} />
  )

  const IconTrash = ({ size = 20 }: { size?: number }) => <TrashIcon width={size} height={size} />

  const actionButtonStyle = (color: string, hoverBg: string): React.CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    border: `2px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  const toDisplayString = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (Array.isArray(value)) {
      if (value.length === 0) return '—'
      const mapItem = (v: any) => {
        if (v === null || v === undefined) return ''
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
          return String(v)
        if (typeof v === 'object') {
          const candidate =
            v.title ||
            v.name ||
            v.display_name ||
            v.filename ||
            v.fileName ||
            v.slug ||
            v.id ||
            v.value
          return candidate ? String(candidate) : ''
        }
        return ''
      }
      const parts = value.map(mapItem).filter(Boolean)
      if (parts.length === 0) return `${value.length} items`
      const shown = parts.slice(0, 3).join(', ')
      return parts.length > 3 ? `${shown} +${parts.length - 3} more` : shown
    }
    if (typeof value === 'object') {
      const candidate =
        value.title ||
        value.name ||
        value.display_name ||
        value.filename ||
        value.fileName ||
        value.slug ||
        value.id
      if (candidate) return String(candidate)
      try {
        const str = JSON.stringify(value)
        return str.length > 60 ? `${str.slice(0, 57)}...` : str
      } catch {
        return '[Object]'
      }
    }
    return String(value)
  }

  const formatDateTime = (value: any): string => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (isNaN(date.getTime())) return 'N/A'
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${mm}/${dd}/${yyyy}, ${hh}:${min}`
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e5e7eb',
            }}
          >
            {columns.map((col) => {
              const active = sortKey === col.key
              const isAsc = active && sortOrder === 'asc'
              const nextOrder: 'asc' | 'desc' = active ? (isAsc ? 'desc' : 'asc') : 'asc'
              return (
                <th
                  key={col.key}
                  style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    letterSpacing: '0.05em',
                    cursor: onSortChange ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                  onClick={() => onSortChange && onSortChange(col.key, nextOrder)}
                  aria-sort={active ? (isAsc ? 'ascending' : 'descending') : 'none'}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {col.label}
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        lineHeight: 1,
                        marginLeft: 2,
                      }}
                    >
                      <svg
                        width={10}
                        height={10}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: active && isAsc ? '#6b7280' : '#d1d5db' }}
                      >
                        <path d="M7 14l5-5 5 5H7z" fill="currentColor" />
                      </svg>
                      <svg
                        width={10}
                        height={10}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: active && !isAsc ? '#6b7280' : '#d1d5db' }}
                      >
                        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                </th>
              )
            })}
            <th
              style={{
                padding: '16px 20px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                letterSpacing: '0.05em',
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {(loading ? Array.from({ length: skeletonRowCount }) : items).map((row, index) => (
            <tr
              key={loading ? `skeleton-${index}` : row.id}
              style={{
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '16px 20px' }}>
                  {loading ? (
                    col.type === 'status' ? (
                      <div
                        style={{ width: 44, height: 24, borderRadius: 9999 }}
                        className="skeleton"
                      />
                    ) : (
                      <div
                        style={{ width: '70%', height: 14, borderRadius: 6 }}
                        className="skeleton"
                      />
                    )
                  ) : col.type === 'status' ? (
                    (() => {
                      const value = row[col.key]
                      const isOn =
                        value === 'ACTIVE' ||
                        value === 'published' ||
                        value === true ||
                        value === 'active'
                      const mapNext = (checked: boolean) => {
                        if (value === 'ACTIVE' || value === 'INACTIVE') {
                          return checked ? 'ACTIVE' : 'INACTIVE'
                        }
                        if (value === 'published' || value === 'draft') {
                          return checked ? 'published' : 'draft'
                        }
                        if (value === 'active' || value === 'inactive') {
                          return checked ? 'active' : 'inactive'
                        }
                        return checked
                      }
                      return (
                        <Switch.Root
                          checked={isOn}
                          onCheckedChange={(checked) =>
                            onToggleField && onToggleField(row.id, col.key, mapNext(checked))
                          }
                          aria-label="Toggle status"
                          style={{
                            cursor: 'pointer',
                            width: 44,
                            height: 24,
                            borderRadius: 9999,
                            background: isOn ? '#16a34a' : '#f3f4f6',
                            border: '1px solid ' + (isOn ? '#16a34a' : '#d1d5db'),
                            position: 'relative',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          <Switch.Thumb
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: isOn ? 22 : 2,
                              width: 20,
                              height: 20,
                              background: '#fff',
                              borderRadius: '9999px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                              transform: 'translateY(-50%)',
                              transition: 'left 0.15s ease',
                            }}
                          />
                        </Switch.Root>
                      )
                    })()
                  ) : col.type === 'date' ? (
                    formatDateTime(row[col.key])
                  ) : (
                    // text/default (handles arrays/objects safely)
                    <div>
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '15px',
                          color: '#111827',
                          marginBottom: '4px',
                        }}
                      >
                        {toDisplayString(row[col.key])}
                      </div>
                    </div>
                  )}
                </td>
              ))}
              <td style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {loading ? (
                    <>
                      <div
                        style={{ width: 40, height: 40, borderRadius: 10 }}
                        className="skeleton"
                      />
                      <div
                        style={{ width: 40, height: 40, borderRadius: 10 }}
                        className="skeleton"
                      />
                      <div
                        style={{ width: 40, height: 40, borderRadius: 10 }}
                        className="skeleton"
                      />
                    </>
                  ) : (
                    <>
                      <button
                        aria-label="Preview"
                        title="Preview"
                        onClick={() => onPreview(row.id)}
                        style={actionButtonStyle('#8b5cf6', 'rgba(139,92,246,0.1)')}
                        onMouseEnter={(e) => {
                          e.currentTarget.setAttribute('data-hover', 'true')
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'rgba(139,92,246,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.removeAttribute('data-hover')
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'
                        }}
                      >
                        <IconEye />
                      </button>
                      <button
                        aria-label="Edit"
                        title="Edit"
                        onClick={() => onEdit(row.id)}
                        style={actionButtonStyle('#3b82f6', 'rgba(59,130,246,0.1)')}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'rgba(59,130,246,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'
                        }}
                      >
                        <IconPencil />
                      </button>
                      <button
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => onDelete(row.id)}
                        style={actionButtonStyle('#ef4444', 'rgba(239,68,68,0.1)')}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            'rgba(239,68,68,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff'
                        }}
                      >
                        <IconTrash />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
