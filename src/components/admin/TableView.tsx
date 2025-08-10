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
}: TableViewProps) {
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
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  letterSpacing: '0.05em',
                }}
              >
                {col.label}
              </th>
            ))}
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
                    // text/default
                    <div>
                      <div
                        style={{
                          fontWeight: '600',
                          fontSize: '15px',
                          color: '#111827',
                          marginBottom: '4px',
                        }}
                      >
                        {item[col.key] ?? 'N/A'}
                      </div>
                    </div>
                  )}
                </td>
              ))}
              <td style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onPreview(item.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
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
                    Preview
                  </button>
                  <button
                    onClick={() => onEdit(item.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #3b82f6',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6'
                      e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.color = '#3b82f6'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444'
                      e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                  >
                    Delete
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
