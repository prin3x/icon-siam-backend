import React from 'react'
import { useLocale } from './LocaleContext'

export function LocaleSwitcher() {
  const { locale, setLocale, supported } = useLocale()

  return (
    <div
      style={{
        marginBottom: 24,
        padding: '16px 20px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {supported.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            style={{
              padding: '10px 16px',
              border: locale === l.code ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: locale === l.code ? '#3b82f6' : '#ffffff',
              color: locale === l.code ? '#ffffff' : '#374151',
              cursor: 'pointer',
              fontWeight: locale === l.code ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow:
                locale === l.code
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (locale !== l.code) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
              }
            }}
            onMouseLeave={(e) => {
              if (locale !== l.code) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
