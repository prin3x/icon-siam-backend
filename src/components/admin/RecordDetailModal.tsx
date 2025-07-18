import React, { useEffect, useState } from 'react'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { RichTextEditor } from './RichTextEditor'
import { ImageUpload } from './ImageUpload'
import { ComboBox } from './ComboBox'

interface RecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  recordId: string
  collectionSlug: string
  locale: string
  onSuccess?: () => void
}

interface RecordData {
  id: string
  title?: string
  name?: string
  subtitle?: string
  description?: string
  content?: any
  status?: string
  slug?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
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

export function RecordDetailModal({
  isOpen,
  onClose,
  recordId,
  collectionSlug,
  locale,
  onSuccess,
}: RecordDetailModalProps) {
  const [record, setRecord] = useState<RecordData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [schema, setSchema] = useState<FieldSchema[]>([])

  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecordDetails()
      fetchSchema()
    }
  }, [isOpen, recordId])

  const fetchRecordDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/authenticated/${collectionSlug}/${recordId}?locale=${locale}`,
        {
          headers: getApiHeaders(!isInternalRequest()),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      setRecord(data)
      setFormData(data) // Initialize form data with current record
    } catch (error: any) {
      console.error('Error fetching record details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/admin/${collectionSlug}/${recordId}`, {
        method: 'PATCH',
        headers: getApiHeaders(!isInternalRequest()),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Record updated:', data)

      setRecord(data)
      setIsEditMode(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating record:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setFormData(record || {})
    setError('')
  }

  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return 'N/A'

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        // Handle rich text arrays
        if (value.length > 0 && value[0]?.type === 'paragraph') {
          return value
            .map((node: any) => {
              if (node.type === 'paragraph' && node.children) {
                return node.children.map((child: any) => child.text || '').join('')
              }
              return node.text || ''
            })
            .join('\n')
        }
        // Handle image arrays
        if (value.length > 0 && (value[0]?.url || value[0]?.filename)) {
          return `${value.length} image(s)`
        }
        return value.length > 0 ? `${value.length} items` : 'Empty'
      }
      // Handle single image object
      if (value.url || value.filename) {
        return `Image: ${value.filename || 'Unknown'}`
      }
      return JSON.stringify(value, null, 2)
    }

    if (key.includes('date') || key.includes('Date')) {
      try {
        return new Date(value).toLocaleString()
      } catch {
        return String(value)
      }
    }

    return String(value)
  }

  const renderField = (field: FieldSchema) => {
    const value = formData[field.name] || field.defaultValue || ''
    const isRequired = field.required

    switch (field.type) {
      case 'text':
      case 'number':
      case 'email':
      case 'textarea':
      case 'richText':
      case 'image':
      case 'comboBox':
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
            ) : field.type === 'comboBox' ? (
              <ComboBox
                value={value}
                onChange={(newValue) => handleInputChange(field.name, newValue)}
                options={field.options || []}
                placeholder={`Type or select ${field.label.toLowerCase()}...`}
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
                type={
                  field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'
                }
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
              {field.options?.map((option) => {
                // Handle different option formats
                const value = typeof option === 'string' ? option : option.value || option
                const label = typeof option === 'string' ? option : option.label || option
                return (
                  <option key={String(value)} value={String(value)}>
                    {String(label)}
                  </option>
                )
              })}
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

  const renderContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Loading record details...
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          Error: {error}
        </div>
      )
    }

    if (!record) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          No record found
        </div>
      )
    }

    if (isEditMode) {
      const excludedKeys = ['id', 'createdAt', 'updatedAt']
      const priorityKeys = ['title', 'name', 'subtitle', 'description', 'content', 'status', 'slug']

      // Sort schema fields by priority
      const sortedSchema = [...schema].sort((a, b) => {
        const aPriority = priorityKeys.indexOf(a.name)
        const bPriority = priorityKeys.indexOf(b.name)

        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority
        }
        if (aPriority !== -1) return -1
        if (bPriority !== -1) return 1

        return a.name.localeCompare(b.name)
      })

      return (
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Record ID and Timestamps */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                Record ID: {record.id}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Locale: {locale}</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
              <span>
                Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}
              </span>
              <span>
                Updated: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <div style={{ display: 'grid', gap: '16px' }}>
              {sortedSchema
                .filter((field) => !excludedKeys.includes(field.name))
                .map((field) => renderField(field))}
            </div>
          </form>
        </div>
      )
    }

    // View mode (original display)
    const excludedKeys = ['id', 'createdAt', 'updatedAt']
    const priorityKeys = ['title', 'name', 'subtitle', 'description', 'content', 'status', 'slug']

    const sortedKeys = Object.keys(record).sort((a, b) => {
      const aPriority = priorityKeys.indexOf(a)
      const bPriority = priorityKeys.indexOf(b)

      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority
      }
      if (aPriority !== -1) return -1
      if (bPriority !== -1) return 1

      return a.localeCompare(b)
    })

    return (
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Record ID and Timestamps */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              Record ID: {record.id}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Locale: {locale}</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
            <span>
              Created: {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}
            </span>
            <span>
              Updated: {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {sortedKeys
            .filter((key) => !excludedKeys.includes(key))
            .map((key) => {
              const isComplex =
                typeof record[key] === 'object' &&
                record[key] !== null &&
                !Array.isArray(record[key])

              return (
                <div
                  key={key}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                    }}
                  >
                    {isComplex ? (
                      <pre
                        style={{
                          backgroundColor: '#f9fafb',
                          padding: '12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {formatValue(record[key], key)}
                      </pre>
                    ) : (
                      formatValue(record[key], key)
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
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
          maxWidth: '800px',
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
              {isEditMode ? 'Edit Record' : 'Record Details'}
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
        <div style={{ padding: '24px', flex: 1, overflow: 'hidden' }}>{renderContent()}</div>

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
          {isEditMode ? (
            <>
              <button
                onClick={handleCancel}
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
                onClick={handleSave}
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#9ca3af'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
              >
                Close
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.borderColor = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
              >
                Edit Record
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
