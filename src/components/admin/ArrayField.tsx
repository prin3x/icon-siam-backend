import React, { useState } from 'react'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'
import { ComboBox } from './ComboBox'
import { RelationshipField } from './RelationshipField'

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

  const addItem = () => {
    const newItem: any = {}
    // Initialize with default values
    field.fields?.forEach((subField) => {
      newItem[subField.name] = subField.defaultValue || ''
    })

    const newItems = [...items, newItem]
    setItems(newItems)
    // Don't call onChange immediately when adding an empty item
    // onChange will be called when the user actually modifies the item content
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

  const renderSubField = (subField: any, itemValue: any, itemIndex: number) => {
    const value = itemValue[subField.name] || ''

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
          <ImageUpload
            value={value}
            onChange={handleChange}
            placeholder={`Upload ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
          />
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
            placeholder={`Type or select ${subField?.label?.toLowerCase() || subField.name?.toLowerCase()}...`}
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
          <label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(e.target.checked)}
            />
            {subField.label}
          </label>
        ) : subField.type === 'array' ? (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            Array field: {subField.name} (not yet implemented)
          </div>
        ) : subField.type === 'group' ? (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            Group field: {subField.name} (not yet implemented)
          </div>
        ) : subField.type === 'tabs' ? (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            Tabs field: {subField.name} (not yet implemented)
          </div>
        ) : subField.type === 'row' ? (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            Row field: {subField.name} (not yet implemented)
          </div>
        ) : subField.type === 'collapsible' ? (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            Collapsible field: {subField.name} (not yet implemented)
          </div>
        ) : (
          <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
            {subField.type} field: {subField.name} (not yet implemented)
          </div>
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
    <div>
      <button onClick={addItem} style={{ marginBottom: '12px' }}>
        Add Item
      </button>
      {items.map((item, index) => (
        <div key={index}>
          {renderSubField(field.fields![index], item, index)}
          <button onClick={() => removeItem(index)}>Remove</button>
        </div>
      ))}
    </div>
  )
}
