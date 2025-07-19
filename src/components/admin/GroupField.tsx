import React from 'react'
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

interface GroupFieldProps {
  field: FieldSchema
  value: any
  onChange: (value: any) => void
}

export function GroupField({ field, value, onChange }: GroupFieldProps) {
  const handleInputChange = (fieldName: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    })
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{field.label}</h3>
      {field.fields?.map((subField) => (
        <FieldRenderer
          key={subField.name}
          field={subField}
          formData={value || {}}
          handleInputChange={(fieldName: string, fieldValue: any) =>
            handleInputChange(subField.name, fieldValue)
          }
        />
      ))}
    </div>
  )
}
