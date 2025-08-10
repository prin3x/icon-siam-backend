'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { navigateWithLocale } from '@/utilities/navigation'
import { FieldRenderer } from './FieldRenderer'
import { FORM_LAYOUTS, getLayoutForCollection, type CollectionFormLayout } from './formLayouts'

interface RecordEditFormProps {
  collectionSlug: string
  recordId?: string
}

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

export function RecordEditForm({ collectionSlug, recordId }: RecordEditFormProps) {
  const router = useRouter()
  const { locale } = useLocale()
  const [record, setRecord] = useState<any>(null)
  const [schema, setSchema] = useState<FieldSchema[]>([])
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const isCreateMode = !recordId

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchRecordAndSchema = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch schema from the correct custom-admin endpoint
        const schemaResponse = await fetch(
          `/api/admin/${collectionSlug}?schema=true&locale=${locale}`,
          { signal },
        )

        if (!signal.aborted && !schemaResponse.ok) {
          throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`)
        }

        const schemaData = await schemaResponse.json()
        if (signal.aborted) return
        setSchema(schemaData.fields || [])

        if (isCreateMode) {
          // Initialize form with default values for new record
          const initialFormData: any = {}
          schemaData.fields?.forEach((field: FieldSchema) => {
            initialFormData[field.name] = field.defaultValue || ''
          })
          setFormData(initialFormData)
        } else {
          // Fetch existing record data for editing
          const recordResponse = await fetch(
            `/api/custom-admin/${collectionSlug}/${recordId}?locale=${locale}&depth=3`,
            { signal },
          )

          if (!signal.aborted && !recordResponse.ok) {
            throw new Error(`Failed to fetch record: ${recordResponse.statusText}`)
          }

          const recordData = await recordResponse.json()
          if (signal.aborted) return
          setRecord(recordData)

          // Initialize form with existing data
          const initialFormData: any = {}
          schemaData.fields?.forEach((field: FieldSchema) => {
            const value = recordData[field.name]
            if (field.type === 'date' && value) {
              initialFormData[field.name] = new Date(value).toISOString().split('T')[0]
            } else {
              initialFormData[field.name] = value || field.defaultValue || ''
            }
          })
          setFormData(initialFormData)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error)
          setError(error.message)
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    if (collectionSlug) {
      fetchRecordAndSchema()
    }

    return () => {
      controller.abort()
    }
  }, [collectionSlug, recordId, locale, isCreateMode])

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const processedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '') {
          const anyValue = value as any
          if (typeof anyValue === 'object' && anyValue !== null && anyValue.id) {
            // Handle populated media object
            acc[key] = anyValue.id
          } else {
            acc[key] = value
          }
        }
        return acc
      }, {} as any)

      const url = isCreateMode
        ? `/api/custom-admin/${collectionSlug}?locale=${locale}`
        : `/api/custom-admin/${collectionSlug}/${recordId}?locale=${locale}`

      const method = isCreateMode ? 'POST' : 'PATCH'

      // Update the record using the correct custom-admin endpoint
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedFormData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        const errorMessage = `Failed to ${isCreateMode ? 'create' : 'update'} record: ${errorData}`
        throw new Error(errorMessage)
      }

      // Redirect back to collection page
      navigateWithLocale(router, `/custom-admin/collections/${collectionSlug}`, locale)
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} record:`, error)
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px',
          }}
        >
          <div style={{ color: '#6b7280', fontSize: '16px' }}>Loading record...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ color: '#dc2626' }}>Error: {error}</div>
        </div>
      </div>
    )
  }

  const layout: CollectionFormLayout | undefined = getLayoutForCollection(
    collectionSlug,
    schema as any,
  )

  const renderSection = (
    title: string,
    fieldsList: string[],
    description?: string,
    wrap: boolean = true,
  ) => {
    const sectionFields = fields.filter((f) => fieldsList.includes(f.name))
    if (sectionFields.length === 0) return null
    if (!wrap) {
      return (
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sectionFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            ))}
          </div>
        </section>
      )
    }
    return (
      <section style={{ marginBottom: 16 }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            padding: 16,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</div>
          {description && (
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{description}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sectionFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Keep all fetched schema fields accessible
  const fields = schema
  console.log(fields, 'fields')

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 8px 0',
          }}
        >
          {isCreateMode ? `Create New ${collectionSlug}` : `Edit ${collectionSlug} Record`}
        </h1>
        {!isCreateMode && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
            Record ID: {recordId} | Locale: {locale}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ paddingBottom: '100px' }}>
        {layout ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: layout.right ? 'minmax(0,1fr) 320px' : '1fr',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {layout.left.map((section) =>
                renderSection(section.title, section.fields, section.description, section.wrap),
              )}
            </div>
            {layout.right && (
              <aside
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'sticky',
                  top: 16,
                }}
              >
                {layout.right.map((section) =>
                  renderSection(section.title, section.fields, section.description, section.wrap),
                )}
              </aside>
            )}
          </div>
        ) : (
          // Fallback: render fields in natural order
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            backdropFilter: 'saturate(180%) blur(5px)',
            WebkitBackdropFilter: 'saturate(180%) blur(5px)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginLeft: '-24px',
            marginBottom: '-24px',
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigateWithLocale(router, `/custom-admin/collections/${collectionSlug}`, locale)
            }
            style={{
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              border: '1px solid transparent',
              borderRadius: '8px',
              backgroundColor: saving ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            {saving ? 'Saving...' : isCreateMode ? 'Create Record' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
