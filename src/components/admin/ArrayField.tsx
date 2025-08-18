import React, { useEffect, useState } from 'react'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'
import { ComboBox } from './ComboBox'
import { RelationshipField } from './RelationshipField'
import { GroupField } from './GroupField'
import { TabsField } from './TabsField'
import { RowField } from './RowField'
import { CollapsibleField } from './CollapsibleField'
import { shouldHideField } from '@/utilities/fieldDisplay'

interface ArrayFieldProps {
  value: any[]
  onChange: (value: any[]) => void
  field: {
    name: string
    label: string
    fields?: Array<{
      name: string
      type: string
      label: string
      required?: boolean
      localized?: boolean
      relationTo?: string | string[]
      hasMany?: boolean
      options?: Array<{ label: string; value: string }>
      defaultValue?: any
    }>
  }
}

export function ArrayField({ value, onChange, field }: ArrayFieldProps) {
  const [items, setItems] = useState<any[]>(value || [])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    // Sync items state with external value changes
    if (value && JSON.stringify(value) !== JSON.stringify(items)) {
      setItems(value)
    }
  }, [value])

  const addItem = () => {
    const newItem: any = {}
    // Initialize with default values
    field.fields?.forEach((subField) => {
      if (shouldHideField(subField)) return
      newItem[subField.name] = subField.defaultValue ?? ''
    })

    const newItems = [...items, newItem]
    setItems(newItems)
    onChange(newItems)
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    onChange(newItems)
  }

  const updateItem = (index: number, fieldName: string, fieldValue: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [fieldName]: fieldValue }
    setItems(newItems)
    onChange(newItems)
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setItems(next)
    onChange(next)
  }

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  const handleDrop = (index: number) => {
    if (dragIndex === null) return
    moveItem(dragIndex, index)
    setDragIndex(null)
  }

  const renderSubField = (subField: any, itemValue: any, itemIndex: number) => {
    if (shouldHideField(subField)) return null
    const value = itemValue?.[subField.name] ?? ''

    const handleChange = (newValue: any) => {
      updateItem(itemIndex, subField.name, newValue)
    }

    return (
      <div key={subField.name} style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px',
          }}
        >
          {subField.label}
          {subField.required && <span style={{ color: '#ef4444' }}> *</span>}
        </label>

        {subField.type === 'richText' ? (
          <RichTextEditor
            value={value}
            onChange={handleChange}
            placeholder={`Enter ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
          />
        ) : subField.type === 'upload' || subField.type === 'image' ? (
          <ImageUpload value={value} onChange={handleChange} />
        ) : subField.type === 'relationship' ? (
          <RelationshipField
            value={value}
            onChange={handleChange}
            field={subField}
            placeholder={`Select ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
          />
        ) : subField.type === 'comboBox' ? (
          <ComboBox
            value={value}
            onChange={handleChange}
            options={subField.options || []}
            placeholder={`Type or select ${
              subField?.label?.toLowerCase() || subField.name?.toLowerCase()
            }...`}
          />
        ) : subField.type === 'select' ? (
          <select
            value={value}
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
            <option value="">
              Select {subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...
            </option>
            {subField.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : subField.type === 'checkbox' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#3b82f6',
              }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>{subField.label}</span>
          </label>
        ) : subField.type === 'group' ? (
          <GroupField field={subField} value={value} onChange={handleChange} />
        ) : subField.type === 'tabs' ? (
          <TabsField field={subField} value={value} onChange={handleChange} />
        ) : subField.type === 'row' ? (
          <RowField field={subField} value={value} onChange={handleChange} />
        ) : subField.type === 'collapsible' ? (
          <CollapsibleField field={subField} value={value} onChange={handleChange} />
        ) : subField.type === 'text' || subField.type === 'textarea' ? (
          <textarea
            value={value}
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
            placeholder={`Enter ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
        ) : (
          <input
            type={subField.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            placeholder={`Enter ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
              e.target.style.boxShadow = 'none'
            }}
          />
        )}
      </div>
    )
  }

  if (!field.fields || field.fields.length === 0) {
    return (
      <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
        Array field: {field.name} (no fields configured)
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #d1d5db', padding: '16px', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{field.label}</h3>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
          style={{
            border: '1px solid #e5e7eb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            position: 'relative',
            backgroundColor: dragIndex === index ? '#f9fafb' : '#fff',
            cursor: 'grab',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Item {index + 1}</span>
              <span title="Drag to reorder" style={{ userSelect: 'none', color: '#9ca3af' }}>
                ≡
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#374151',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === items.length - 1}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#374151',
                  cursor: index === items.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </div>
          {field.fields?.map((subField) => renderSubField(subField, item, index))}
        </div>
      ))}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          addItem()
        }}
        style={{
          padding: '8px 16px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#374151',
          cursor: 'pointer',
        }}
      >
        Add {field.label}
      </button>
    </div>
  )
}
