import React, { useState, useEffect } from 'react'

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

  const collectionsKey = JSON.stringify(collections)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchOptions = async () => {
      setLoading(true)
      setError('')

      try {
        const allOptions: RelatedRecord[] = []

        // Fetch options from each related collection
        for (const collection of collections) {
          const response = await fetch(`/api/custom-admin/${collection}?limit=100`, { signal })

          if (!signal.aborted && !response.ok) {
            throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
          }

          const data = await response.json()
          if (signal.aborted) return

          const records = data.docs || []

          // Transform records to include collection info
          const transformedRecords = records.map((record: any) => ({
            ...record,
            collection: collection,
            displayTitle: record.title || record.name || `Record ${record.id}`,
          }))

          allOptions.push(...transformedRecords)
        }
        if (!signal.aborted) {
          setOptions(allOptions)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching relationship options:', error)
          setError(error.message)
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }
    if (collections.length > 0) {
      fetchOptions()
    }

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionsKey])

  const handleChange = (selectedValue: string) => {
    if (!selectedValue) return

    const [collection, id] = selectedValue.split(':')
    const recordToToggle = { relationTo: collection, value: id }

    if (field.hasMany) {
      const currentValues = Array.isArray(value) ? value : []
      const isSelected = currentValues.some(
        (item) => item.relationTo === collection && item.value === id,
      )

      const newValues = isSelected
        ? currentValues.filter((item) => !(item.relationTo === collection && item.value === id))
        : [...currentValues, recordToToggle]
      onChange(newValues)
    } else {
      onChange(recordToToggle)
    }
  }

  const getSelectedRecords = () => {
    if (!value) return []
    const selectedItems = field.hasMany ? (Array.isArray(value) ? value : []) : [value]

    return selectedItems
      .map((item) => {
        if (!item || !item.value) return null
        const foundOption = options.find(
          (option) => option.id === item.value && option.collection === item.relationTo,
        )
        return foundOption || null
      })
      .filter(Boolean) as RelatedRecord[]
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
            {selectedRecords.map((record, index) => (
              <div
                key={`${record.collection}:${record.id}:${index}`}
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
                  onClick={() => handleChange(`${record.collection}:${record.id}`)}
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
        {options.map((option, index) => (
          <option
            key={`${option.collection}:${option.id}:${index}`}
            value={`${option.collection}:${option.id}`}
          >
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
