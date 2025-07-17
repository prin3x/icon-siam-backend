import React from 'react'

interface GridViewProps {
  items: any[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function GridView({ items, onEdit, onDelete }: GridViewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: '24px',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
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
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '16px 16px 0 0',
            }}
          />

          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              lineHeight: '1.3',
            }}
          >
            {item.title || item.name || item.id}
          </h4>

          {item.description && (
            <p
              style={{
                margin: '0 0 16px 0',
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.6',
              }}
            >
              {item.description}
            </p>
          )}

          {item.status && (
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#fef2f2',
                  color: item.status === 'ACTIVE' ? '#166534' : '#dc2626',
                  display: 'inline-block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {item.status}
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <button
              onClick={() => onEdit(item.id)}
              style={{
                padding: '10px 20px',
                border: '1px solid #3b82f6',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#3b82f6'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              style={{
                padding: '10px 20px',
                border: '1px solid #ef4444',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444'
                e.currentTarget.style.color = '#ffffff'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
