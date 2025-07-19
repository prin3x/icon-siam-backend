import { ArrayField } from './ArrayField'
import { CollapsibleField } from './CollapsibleField'
import { ComboBox } from './ComboBox'
import { GroupField } from './GroupField'
import { ImageUpload } from './ImageUpload'
import { RelationshipField } from './RelationshipField'
import { RichTextEditor } from './RichTextEditor'
import { RowField } from './RowField'
import { TabsField } from './TabsField'

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
}

export function FieldRenderer({ field, formData, handleInputChange }: FieldRendererProps) {
  const value = formData[field.name] || field.defaultValue || ''
  const isRequired = field.required

  return (
    <div key={field.name} style={{ marginBottom: '24px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px',
        }}
      >
        {field.label}
        {isRequired && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>

      {field.type === 'richText' ? (
        <RichTextEditor
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
          placeholder={`Enter ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
        />
      ) : field.type === 'upload' || field.type === 'image' ? (
        <ImageUpload
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
          placeholder={`Upload ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
        />
      ) : field.type === 'comboBox' ? (
        <ComboBox
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
          options={field.options || []}
          placeholder={`Type or select ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
        />
      ) : field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
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
            Select {field?.label?.toLowerCase() || field.name?.toLowerCase()}...
          </option>
          {field.options?.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#3b82f6',
            }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>{field?.label || field.name}</span>
        </label>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            resize: 'vertical',
          }}
          rows={4}
          placeholder={`Enter ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
        />
      ) : field.type === 'date' ? (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
        />
      ) : field.type === 'relationship' ? (
        <RelationshipField
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
          field={field}
          placeholder={`Select ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
        />
      ) : field.type === 'array' ? (
        <ArrayField
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
          field={field}
        />
      ) : field.type === 'group' ? (
        <GroupField
          field={field}
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
        />
      ) : field.type === 'tabs' ? (
        <TabsField
          field={field}
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
        />
      ) : field.type === 'row' ? (
        <RowField
          field={field}
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
        />
      ) : field.type === 'collapsible' ? (
        <CollapsibleField
          field={field}
          value={value}
          onChange={(newValue: any) => handleInputChange(field.name, newValue)}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          placeholder={`Enter ${field?.label?.toLowerCase() || field.name?.toLowerCase()}...`}
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
