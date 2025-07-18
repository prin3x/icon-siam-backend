import React, { useEffect, useState } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'

interface CreateRecordModalProps {
  isOpen: boolean
  onClose: () => void
  collectionSlug: string
  locale: string
  onSuccess: () => void
}

interface FieldSchema {
  name: string
  type: string
  label: string
  required?: boolean
  localized?: boolean
  options?: Array<{ label: string; value: string }>
  defaultValue?: any
}

const API_URL = '/api'

export function CreateRecordModal({
  isOpen,
  onClose,
  collectionSlug,
  locale,
  onSuccess,
}: CreateRecordModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [schema, setSchema] = useState<FieldSchema[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchSchema()
      setFormData({})
      setError('')
    }
  }, [isOpen, collectionSlug])

  const fetchSchema = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/${collectionSlug}?schema=true&locale=${locale}`,
        {
          headers: getApiHeaders(!isInternalRequest()),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch schema`)
      }

      const data = await response.json()
      setSchema(data.fields || [])
    } catch (error: any) {
      console.error('Error fetching schema:', error)
      // Fallback to basic fields if schema fetch fails
      setSchema([
        { name: 'title', type: 'text', label: 'Title', required: true },
        { name: 'description', type: 'textarea', label: 'Description' },
        {
          name: 'status',
          type: 'select',
          label: 'Status',
          required: true,
          options: [
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ],
          defaultValue: 'ACTIVE',
        },
      ])
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    schema.forEach((field) => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        errors.push(`${field.label} is required`)
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/admin/${collectionSlug}`, {
        method: 'POST',
        headers: getApiHeaders(!isInternalRequest()),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Record created:', data)

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating record:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FieldSchema) => {
    const value = formData[field.name] || field.defaultValue || ''
    const isRequired = field.required

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richText':
      case 'image':
        return (
          <div key={field.name} style={{ marginBottom: '20px' }}>
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
              {isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {field.type === 'richText' ? (
              <RichTextEditor
                value={value}
                onChange={(newValue) => handleInputChange(field.name, newValue)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            ) : field.type === 'image' ? (
              <ImageUpload
                value={value}
                onChange={(newValue) => handleInputChange(field.name, newValue)}
                placeholder={`Upload ${field.label.toLowerCase()}...`}
              />
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
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            ) : (
              <input
                type="text"
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
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} style={{ marginBottom: '20px' }}>
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
              {isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
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
              <option value="">Select {field.label.toLowerCase()}...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              {field.label}
              {isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
          </div>
        )

      case 'date':
        return (
          <div key={field.name} style={{ marginBottom: '20px' }}>
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
              {isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="date"
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
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        )

      default:
        return (
          <div key={field.name} style={{ marginBottom: '20px' }}>
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
              {isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="text"
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
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 0 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              Create New Record
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#6b7280',
              }}
            >
              {collectionSlug.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '20px',
              color: '#6b7280',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>{schema.map(renderField)}</div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px 24px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = '#d1d5db'
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: '1px solid #10b981',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#059669'
                e.currentTarget.style.borderColor = '#059669'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#10b981'
                e.currentTarget.style.borderColor = '#10b981'
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Creating...
              </>
            ) : (
              'Create Record'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
