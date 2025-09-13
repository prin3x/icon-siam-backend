import React from 'react'

interface PreviewLinkFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function PreviewLinkField({
  value,
  onChange,
  label = 'URL',
  placeholder = 'https://example.com',
}: PreviewLinkFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 500 }}>{label}</label>
      <input
        type="url"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: 14,
        }}
      />
      {value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
          Open
        </a>
      ) : (
        <span style={{ color: '#9ca3af', fontSize: 12 }}>Enter a URL to preview</span>
      )}
    </div>
  )
}
