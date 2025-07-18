import React, { useState, useRef, useEffect } from 'react'

interface ComboBoxProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  placeholder?: string
  readOnly?: boolean
}

export function ComboBox({
  value,
  onChange,
  options,
  placeholder,
  readOnly = false,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filter options based on input
  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.value.toLowerCase().includes(inputValue.toLowerCase()),
      )
      setFilteredOptions(filtered)
    }
  }, [inputValue, options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleOptionSelect = (option: { label: string; value: string }) => {
    setInputValue(option.label)
    onChange(option.value)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    if (!readOnly) {
      setIsOpen(true)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      handleOptionSelect(filteredOptions[0])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder || 'Type or select...'}
        readOnly={readOnly}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.2s ease',
          backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
        onMouseEnter={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!readOnly) {
            e.currentTarget.style.borderColor = '#d1d5db'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />

      {/* Dropdown arrow */}
      {!readOnly && (
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280',
            fontSize: '12px',
          }}
        >
          ▼
        </div>
      )}

      {/* Dropdown options */}
      {isOpen && !readOnly && filteredOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px',
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                borderBottom: index < filteredOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* No options message */}
      {isOpen && !readOnly && filteredOptions.length === 0 && inputValue && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            marginTop: '4px',
            padding: '10px 12px',
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          No options found. You can type a custom value.
        </div>
      )}
    </div>
  )
}
