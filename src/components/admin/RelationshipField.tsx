import React, { useState, useEffect } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'

interface RelationshipFieldProps {
  value: any
  onChange: (value: any) => void
  field: {
    name: string
    label: string
    relationTo?: string | string[]
    hasMany?: boolean
  }
  placeholder?: string
}

interface RelatedRecord {
  id: string
  title?: string
  name?: string
  [key: string]: any
}

export function RelationshipField({ value, onChange, field, placeholder }: RelationshipFieldProps) {
  const [options, setOptions] = useState<RelatedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Convert relationTo to array if it's a string
  const collections = field.relationTo
    ? Array.isArray(field.relationTo)
      ? field.relationTo
      : [field.relationTo]
    : []

  useEffect(() => {
    if (collections.length > 0) {
      fetchOptions()
    }
  }, [field.relationTo])

  const fetchOptions = async () => {
    setLoading(true)
    setError('')

    try {
      const allOptions: RelatedRecord[] = []

      // Fetch options from each related collection
      for (const collection of collections) {
        const response = await fetch(`/api/authenticated/${collection}?limit=100`, {
          headers: getApiHeaders(!isInternalRequest()),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
        }

        const data = await response.json()
        const records = data.docs || []

        // Transform records to include collection info
        const transformedRecords = records.map((record: any) => ({
          ...record,
          collection: collection,
          displayTitle: record.title || record.name || `Record ${record.id}`,
        }))

        allOptions.push(...transformedRecords)
      }

      setOptions(allOptions)
    } catch (error: any) {
      console.error('Error fetching relationship options:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (selectedValue: string) => {
    if (field.hasMany) {
      // Handle multiple selection
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter((v: string) => v !== selectedValue)
        : [...currentValues, selectedValue]
      onChange(newValues)
    } else {
      // Handle single selection
      onChange(selectedValue || null)
    }
  }

  const getSelectedRecords = () => {
    if (!value) return []

    const selectedIds = field.hasMany ? value : [value]
    return options.filter((option) => selectedIds.includes(option.id))
  }

  const selectedRecords = getSelectedRecords()

  if (!field.relationTo || collections.length === 0) {
    return (
      <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
        Relationship field: {field.name} (no related collections configured)
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        Loading {field.label.toLowerCase()}...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ color: '#dc2626', fontSize: '14px' }}>
        Error loading {field.label.toLowerCase()}: {error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Display selected records */}
      {selectedRecords.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            Selected {field.label.toLowerCase()}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {selectedRecords.map((record) => (
              <div
                key={record.id}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{record.displayTitle}</span>
                <button
                  type="button"
                  onClick={() => handleChange(record.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '0',
                    marginLeft: '4px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection dropdown */}
      <select
        value=""
        onChange={(e) => handleChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'all 0.2s ease',
          backgroundColor: '#ffffff',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6'
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.boxShadow = 'none'
        }}
      >
        <option value="">{placeholder || `Select ${field.label.toLowerCase()}...`}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.displayTitle} ({option.collection})
          </option>
        ))}
      </select>

      {/* Collection info */}
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        Related to: {collections.join(', ')}
        {field.hasMany && ' (multiple selection allowed)'}
      </div>
    </div>
  )
}
