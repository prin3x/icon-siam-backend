'use client'

import React from 'react'
import { RichTextEditor } from './RichTextEditor'
import { RelationshipField } from './RelationshipField'
import { ArrayField } from './ArrayField'
import { GroupField } from './GroupField'
import { CollapsibleField } from './CollapsibleField'
import { RowField } from './RowField'
import { TabsField } from './TabsField'
import { ImageUpload } from './ImageUpload'

interface FieldRendererProps {
  field: any
  formData: any
  handleInputChange: (fieldName: string, value: any) => void
}

export function FieldRenderer({ field, formData, handleInputChange }: FieldRendererProps) {
  const handleChange = (value: any) => {
    handleInputChange(field.name, value)
  }

  // ;[
  //   {
  //     name: 'cover_photo',
  //     type: 'upload',
  //     localized: true,
  //     label: 'Cover Photo',
  //     relationTo: 'media',
  //     admin: { isSortable: true },
  //     hooks: {},
  //     access: {},
  //   },
  //   {
  //     name: 'thumbnail',
  //     type: 'upload',
  //     localized: true,
  //     label: 'Thumbnail',
  //     relationTo: 'media',
  //     admin: { isSortable: true },
  //     hooks: {},
  //     access: {},
  //   },
  //   {
  //     name: 'facebook_image',
  //     type: 'upload',
  //     localized: true,
  //     label: 'Facebook Image',
  //     relationTo: 'media',
  //     admin: { isSortable: true },
  //     hooks: {},
  //     access: {},
  //   },
  // ]

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'number':
    case 'date':
      return (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            {field.label || field.name}
          </label>
          <input
            type={field.type === 'textarea' ? 'text' : field.type}
            value={formData[field.name] || ''}
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
          />
        </div>
      )
    case 'checkbox':
      return (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={!!formData[field.name]}
            onChange={(e) => handleChange(e.target.checked)}
            style={{
              marginRight: '8px',
              width: '16px',
              height: '16px',
              accentColor: '#3b82f6',
            }}
          />
          <label style={{ fontSize: '14px', color: '#374151' }}>{field.label || field.name}</label>
        </div>
      )
    case 'select':
      return (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            {field.label || field.name}
          </label>
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {field.options?.map((option: { label: string; value: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )
    case 'richText':
      return <RichTextEditor value={formData[field.name]} onChange={handleChange} />
    case 'upload':
      return (
        <div>
          <label>{field.label || field.name}</label>
          <ImageUpload
            value={formData[field.name]}
            onChange={(value) => handleInputChange(field.name, value)}
          />
        </div>
      )
    case 'relationship':
      return (
        <RelationshipField
          field={field}
          value={formData[field.name]}
          onChange={(value) => handleInputChange(field.name, value)}
        />
      )
    case 'array':
      return <ArrayField field={field} value={formData[field.name] || []} onChange={handleChange} />
    case 'group':
      return <GroupField field={field} value={formData[field.name] || {}} onChange={handleChange} />
    case 'collapsible':
      return (
        <CollapsibleField
          field={field}
          value={formData}
          onChange={(value) => handleInputChange(field.name, value)}
        />
      )
    case 'row':
      return (
        <RowField
          field={field}
          value={formData}
          onChange={(value) => handleInputChange(field.name, value)}
        />
      )
    case 'tabs':
      return (
        <TabsField
          field={field}
          value={formData}
          onChange={(value) => handleInputChange(field.name, value)}
        />
      )
    default:
      return (
        <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Unsupported field type: <strong>{field.type}</strong>
          </p>
        </div>
      )
  }
}
