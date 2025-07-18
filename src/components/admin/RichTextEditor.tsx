import React, { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  value: any
  onChange: (value: any) => void
  placeholder?: string
  readOnly?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  useEffect(() => {
    // Load PayloadCMS's rich text editor
    const loadEditor = async () => {
      try {
        // We'll use a simple rich text editor for now
        // In a real implementation, you'd load PayloadCMS's editor
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load rich text editor:', error)
        setIsLoaded(true) // Fallback to textarea
      }
    }

    loadEditor()
  }, [])

  // For now, we'll use a simple textarea as fallback
  // In a real implementation, you'd integrate with PayloadCMS's editor
  if (!isLoaded) {
    return (
      <div
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: '#f9fafb',
          color: '#6b7280',
        }}
      >
        Loading rich text editor...
      </div>
    )
  }

  // Convert rich text value to plain text for display
  const getPlainText = (richTextValue: any): string => {
    if (!richTextValue) return ''

    if (typeof richTextValue === 'string') return richTextValue

    if (Array.isArray(richTextValue)) {
      return richTextValue
        .map((node: any) => {
          if (node.type === 'paragraph' && node.children) {
            return node.children.map((child: any) => child.text || '').join('')
          }
          return node.text || ''
        })
        .join('\n')
    }

    return String(richTextValue)
  }

  // Convert plain text to rich text format
  const getRichTextValue = (plainText: string): any => {
    if (!plainText.trim()) return []

    return [
      {
        type: 'paragraph',
        children: [
          {
            text: plainText,
          },
        ],
      },
    ]
  }

  const plainTextValue = getPlainText(value)

  return (
    <div style={{ width: '100%' }}>
      <textarea
        value={plainTextValue}
        onChange={(e) => {
          const newValue = getRichTextValue(e.target.value)
          onChange(newValue)
        }}
        placeholder={placeholder || 'Enter rich text content...'}
        readOnly={readOnly}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.2s ease',
          minHeight: '150px',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: '1.5',
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
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '4px',
          fontStyle: 'italic',
        }}
      >
        Rich text editor (simplified for demo)
      </div>
    </div>
  )
}
