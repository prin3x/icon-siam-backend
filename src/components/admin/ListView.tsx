import React from 'react'

interface ListViewProps {
  items: any[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPreview: (id: string) => void
}

export function ListView({ items, onEdit, onDelete, onPreview }: ListViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
            e.currentTarget.style.borderColor = '#3b82f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.borderColor = '#e5e7eb'
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                }}
              >
                {item.title || item.name || item.id}
              </h4>
              {item.description && (
                <p
                  style={{
                    margin: '0 0 12px 0',
                    color: '#6b7280',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  {item.description}
                </p>
              )}
              {item.status && (
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                    color: item.status === 'ACTIVE' ? '#166534' : '#dc2626',
                    display: 'inline-block',
                  }}
                >
                  {item.status}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
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
          </div>
        </div>
      ))}
    </div>
  )
}
