import React, { useState } from 'react'
import { FieldRenderer } from './FieldRenderer'

interface FieldSchema {
  name: string
  type: string
  label: string
  required?: boolean
  defaultValue?: any
  options?: Array<{ label: string; value: string }>
  relationTo?: string | string[]
  hasMany?: boolean
  fields?: FieldSchema[]
}

interface CollapsibleFieldProps {
  field: FieldSchema
  value: any
  onChange: (value: any) => void
}

export function CollapsibleField({ field, value, onChange }: CollapsibleFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleInputChange = (fieldName: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    })
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: '600' }}>{field.label}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '16px' }}>
          {field.fields?.map((subField) => (
            <FieldRenderer
              key={subField.name}
              field={subField}
              formData={value || {}}
              handleInputChange={(fieldName, fieldValue) =>
                handleInputChange(subField.name, fieldValue)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
