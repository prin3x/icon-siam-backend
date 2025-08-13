import React from 'react'

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
}: TableViewProps) {
  const IconEye = ({ size = 20 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5c-5 0-9 4.5-10 6 1 1.5 5 6 10 6s9-4.5 10-6c-1-1.5-5-6-10-6Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
        fill="currentColor"
      />
    </svg>
  )

  const IconPencil = ({ size = 20 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.66.16-.16Z"
        fill="currentColor"
      />
    </svg>
  )

  const IconTrash = ({ size = 20 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 7h12l-1 14H7L6 7Zm3-3h6l1 3H8l1-3Z" fill="currentColor" />
    </svg>
  )

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
          {items.map((item, index) => (
            <tr
              key={item.id}
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
                  {col.type === 'status' ? (
                    item[col.key] ? (
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: item[col.key] === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                          color: item[col.key] === 'ACTIVE' ? '#166534' : '#dc2626',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {String(item[col.key])}
                      </span>
                    ) : (
                      'N/A'
                    )
                  ) : col.type === 'date' ? (
                    item[col.key] ? (
                      new Date(item[col.key]).toLocaleDateString()
                    ) : (
                      'N/A'
                    )
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
                        {toDisplayString(item[col.key])}
                      </div>
                    </div>
                  )}
                </td>
              ))}
              <td style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    aria-label="Preview"
                    title="Preview"
                    onClick={() => onPreview(item.id)}
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
                    onClick={() => onEdit(item.id)}
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
                    onClick={() => onDelete(item.id)}
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
