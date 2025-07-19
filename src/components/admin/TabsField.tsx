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
  tabs?: { label: string; fields: FieldSchema[] }[]
}

interface TabsFieldProps {
  field: FieldSchema
  value: any
  onChange: (value: any) => void
}

export function TabsField({ field, value, onChange }: TabsFieldProps) {
  const [activeTab, setActiveTab] = useState(0)

  const handleInputChange = (tabIndex: number, fieldName: string, fieldValue: any) => {
    const tabValue = value?.[tabIndex] || {}
    onChange({
      ...value,
      [tabIndex]: {
        ...tabValue,
        [fieldName]: fieldValue,
      },
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
        {field.tabs?.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: activeTab === index ? '#ffffff' : 'transparent',
              borderBottom: activeTab === index ? '2px solid #3b82f6' : 'none',
              fontWeight: activeTab === index ? '600' : '500',
              color: activeTab === index ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {field.tabs?.map(
          (tab, index) =>
            activeTab === index && (
              <div key={index}>
                {tab.fields.map((subField) => (
                  <FieldRenderer
                    key={subField.name}
                    field={subField}
                    formData={value?.[index] || {}}
                    handleInputChange={(fieldName, fieldValue) =>
                      handleInputChange(index, fieldName, fieldValue)
                    }
                  />
                ))}
              </div>
            ),
        )}
      </div>
    </div>
  )
}
