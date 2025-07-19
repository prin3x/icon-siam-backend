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

interface RowFieldProps {
  field: FieldSchema
  value: any
  onChange: (value: any) => void
}

export function RowField({ field, value, onChange }: RowFieldProps) {
  const handleInputChange = (fieldName: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    })
  }

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {field.fields?.map((subField) => (
        <div key={subField.name} style={{ flex: 1 }}>
          <FieldRenderer
            field={subField}
            formData={value || {}}
            handleInputChange={(fieldName, fieldValue) =>
              handleInputChange(subField.name, fieldValue)
            }
          />
        </div>
      ))}
    </div>
  )
}
