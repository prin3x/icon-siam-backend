'use client'

import React from 'react'
import { ArrayField } from './ArrayField'
import { CollapsibleField } from './CollapsibleField'
import { GroupField } from './GroupField'
import { ImageUpload } from './ImageUpload'
import { RelationshipField } from './RelationshipField'
import { RichTextEditor } from './RichTextEditor'
import { RowField } from './RowField'
import { TabsField } from './TabsField'
import { ComboBox } from './ComboBox'

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

interface FieldRendererProps {
  field: FieldSchema
  formData: any
  handleInputChange: (fieldName: string, value: any) => void
  parentName?: string
}

export function FieldRenderer({
  field,
  formData,
  handleInputChange,
  parentName = '',
}: FieldRendererProps) {
  const fieldKey = parentName ? `${parentName}.${field.name}` : field.name

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'textarea':
      case 'select':
      case 'date':
      case 'number':
        return (
          <div key={fieldKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor={field.name} style={{ fontWeight: '500', color: '#374151' }}>
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                rows={4}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white',
                }}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
            )}
          </div>
        )
      case 'checkbox':
        return (
          <div key={fieldKey} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={!!formData[field.name]}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor={field.name} style={{ fontWeight: '500', color: '#374151' }}>
              {field.label}
            </label>
          </div>
        )
      case 'comboBox':
        return (
          <ComboBox
            value={formData[field.name]}
            onChange={(newValue: any) => handleInputChange(field.name, newValue)}
            options={field.options || []}
            placeholder={`Type or select ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
          />
        )
      case 'relationship':
        return (
          <RelationshipField
            key={fieldKey}
            field={field}
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
          />
        )
      case 'upload':
        return (
          <ImageUpload
            key={fieldKey}
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
            placeholder={`Upload ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
          />
        )
      case 'richText':
        return (
          <RichTextEditor
            key={fieldKey}
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
            placeholder={`Enter ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
          />
        )
      case 'tabs':
        return (
          <TabsField
            key={fieldKey}
            field={field}
            value={formData}
            onChange={(newValue) => handleInputChange(field.name, newValue)}
          />
        )
      case 'group':
        return (
          <GroupField
            key={fieldKey}
            field={field}
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
          />
        )
      case 'array':
        return (
          <ArrayField
            key={fieldKey}
            field={field}
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
          />
        )
      case 'row':
        return (
          <RowField
            key={fieldKey}
            field={field}
            value={formData}
            onChange={(newValue) => handleInputChange(field.name, newValue)}
          />
        )
      case 'collapsible':
        return (
          <CollapsibleField
            key={fieldKey}
            field={field}
            value={formData}
            onChange={(newValue) => handleInputChange(field.name, newValue)}
          />
        )
      default:
        return (
          <div key={fieldKey} style={{ padding: '16px', backgroundColor: '#f3f4f6' }}>
            Unsupported field type: {field.type}
          </div>
        )
    }
  }

  return renderField()
}
