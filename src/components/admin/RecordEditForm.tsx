'use client'

import { shouldHideField } from '@/utilities/fieldDisplay'
import { navigateWithLocale } from '@/utilities/navigation'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FieldRenderer } from './FieldRenderer'
import { getLayoutForCollection, type CollectionFormLayout } from './formLayouts'
import { useLocale } from './LocaleContext'

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
  // Separate load errors from submit/validation errors
  const [loadError, setLoadError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const isCreateMode = !recordId

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchRecordAndSchema = async () => {
      try {
        setLoading(true)
        setLoadError('')

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
          // Initialize form with sensible defaults for new record
          const initialFormData: any = {}
          schemaData.fields?.forEach((field: FieldSchema) => {
            if (shouldHideField(field.name)) return
            if (field.type === 'group') {
              initialFormData[field.name] = {}
            } else if (field.type === 'relationship') {
              // Use [] for hasMany relations to avoid string default leaks
              initialFormData[field.name] = field.hasMany ? [] : ''
            } else if (field.type === 'array') {
              initialFormData[field.name] = []
            } else {
              initialFormData[field.name] = field.defaultValue ?? ''
            }
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
            if (shouldHideField(field.name)) return
            const value = recordData[field.name]
            if (field.type === 'date' && value) {
              initialFormData[field.name] = new Date(value).toISOString().split('T')[0]
            } else if (field.type === 'group') {
              initialFormData[field.name] = value || {}
            } else if (field.type === 'relationship') {
              initialFormData[field.name] = value ?? (field.hasMany ? [] : '')
            } else if (field.type === 'array') {
              initialFormData[field.name] = Array.isArray(value) ? value : []
            } else {
              initialFormData[field.name] = value ?? field.defaultValue ?? ''
            }
          })
          setFormData(initialFormData)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching data:', error)
          setLoadError(error.message)
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
    // Clear field-level error when user edits the field
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev
      const next = { ...prev }
      delete next[fieldName]
      return next
    })
  }

  // Normalize form data into the shape expected by Payload API
  const normalizeForSubmission = (fields: FieldSchema[], data: any): any => {
    const coerceId = (v: any): any => {
      if (typeof v === 'number') return v
      if (typeof v === 'string' && /^\d+$/.test(v)) return Number(v)
      return v
    }
    const result: any = {}
    for (const field of fields) {
      if (shouldHideField(field.name)) continue
      const value = data?.[field.name]
      if (value === undefined) continue

      switch (field.type) {
        case 'group': {
          const nested = normalizeForSubmission(field.fields || [], value || {})
          result[field.name] = nested
          break
        }
        case 'relationship': {
          if (value === '' || value === null) break
          const relationTo = field.relationTo
          const isPoly = Array.isArray(relationTo)
          if (field.hasMany) {
            const items = Array.isArray(value) ? value : value ? [value] : []
            if (isPoly) {
              result[field.name] = items
                .map((it: any) =>
                  it && typeof it === 'object' && 'value' in it
                    ? { relationTo: it.relationTo, value: coerceId(it.value) }
                    : it && typeof it === 'object' && 'id' in it
                      ? {
                          relationTo: (it as any).collection || (relationTo as string[])[0],
                          value: coerceId(it.id),
                        }
                      : null,
                )
                .filter(Boolean)
            } else {
              // single collection expects array of IDs
              const ids = items
                .map((it: any) =>
                  typeof it === 'string' || typeof it === 'number'
                    ? coerceId(it)
                    : it && typeof it === 'object' && 'value' in it
                      ? coerceId((it as any).value)
                      : it && typeof it === 'object' && 'id' in it
                        ? coerceId((it as any).id)
                        : undefined,
                )
                .filter(Boolean)
              result[field.name] = ids
            }
          } else {
            if (isPoly) {
              if (value && typeof value === 'object' && 'value' in value) {
                result[field.name] = {
                  relationTo: (value as any).relationTo,
                  value: coerceId((value as any).value),
                }
              } else if (value && typeof value === 'object' && 'id' in value) {
                result[field.name] = {
                  relationTo:
                    (value as any).collection ||
                    (Array.isArray(relationTo) ? relationTo[0] : relationTo),
                  value: coerceId((value as any).id),
                }
              } else if (typeof value === 'string' || typeof value === 'number') {
                result[field.name] = {
                  relationTo: Array.isArray(relationTo) ? relationTo[0] : (relationTo as any),
                  value: coerceId(value),
                }
              }
            } else {
              // single collection expects a single ID
              if (typeof value === 'string' || typeof value === 'number') {
                result[field.name] = coerceId(value)
              } else if (value && typeof value === 'object' && 'value' in value) {
                result[field.name] = coerceId((value as any).value)
              } else if (value && typeof value === 'object' && 'id' in value) {
                result[field.name] = coerceId((value as any).id)
              }
            }
          }
          break
        }
        case 'upload': {
          if (value && typeof value === 'object' && 'id' in value) {
            result[field.name] = (value as any).id
          } else if (value !== '') {
            result[field.name] = value
          }
          break
        }
        case 'array': {
          // Preserve order; recursively normalize each row according to sub-schema
          const rows = Array.isArray(value) ? value : []
          const normalizedRows = rows.map((row) =>
            normalizeForSubmission((field.fields || []) as any, row),
          )
          result[field.name] = normalizedRows
          break
        }
        case 'number': {
          // Convert empty input to null so Payload clears the value; otherwise coerce to number
          if (value === '') {
            result[field.name] = null
          } else {
            result[field.name] = typeof value === 'number' ? value : Number(value)
          }
          break
        }
        case 'date': {
          // Empty date should clear the field
          result[field.name] = value === '' ? null : value
          break
        }
        case 'text':
        case 'textarea':
        case 'email':
        case 'select':
        case 'url':
        case 'slug':
        case 'checkbox':
        default: {
          // Always include value, even if empty string, so clearing a field persists
          result[field.name] = value
          break
        }
      }
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')
      setFieldErrors({})

      // Basic client-side required validation based on schema
      const missing: Record<string, string> = {}
      schema.forEach((field: FieldSchema) => {
        if (field.required) {
          const v = (formData as any)[field.name]
          const isEmpty =
            v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
          if (isEmpty) missing[field.name] = `${field.label || field.name} is required`
        }
      })
      if (Object.keys(missing).length > 0) {
        setFieldErrors(missing)
        setError('Please fix the highlighted fields and try again.')
        return
      }

      const processedFormData = normalizeForSubmission(schema as any, formData)

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
        // Parse potential validation errors from server
        let message = `Failed to ${isCreateMode ? 'create' : 'update'} record.`
        const nextFieldErrors: Record<string, string> = {}
        try {
          const errJson = await response.json()
          if (typeof errJson?.message === 'string') message = errJson.message
          if (typeof errJson?.error === 'string') message = errJson.error
          if (Array.isArray(errJson?.errors)) {
            errJson.errors.forEach((e: any) => {
              const path = e?.path || e?.field || e?.data?.path
              const msg = e?.message || e?.err || String(e)
              if (path && typeof path === 'string') {
                nextFieldErrors[path] = msg
              }
            })
          }
        } catch (_) {
          try {
            const txt = await response.text()
            if (txt) message = txt
          } catch (_) {}
        }
        if (Object.keys(nextFieldErrors).length > 0) setFieldErrors(nextFieldErrors)
        setError(message)
        return
      }

      // Redirect back to collection page
      navigateWithLocale(router, `/custom-admin/collections/${collectionSlug}`, locale)
    } catch (error: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} record:`, error)
      setError(error.message || 'An unexpected error occurred.')
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

  if (loadError) {
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
          <div style={{ color: '#dc2626' }}>Error: {loadError}</div>
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
        <section className="inline-section" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sectionFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                formData={formData}
                handleInputChange={handleInputChange}
                fieldError={fieldErrors[field.name]}
              />
            ))}
          </div>
        </section>
      )
    }
    return (
      <section className="wrapped-section" style={{ marginBottom: 16 }}>
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
                fieldError={fieldErrors[field.name]}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Keep all fetched schema fields accessible
  const fields = schema.filter((f) => !shouldHideField(f.name))

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 8px 0',
            }}
          >
            {isCreateMode ? `Create New ${collectionSlug}` : `Edit ${collectionSlug}`}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
              cursor: 'pointer',
              borderBottom: '1px solid #d1d5db',
            }}
            onClick={() => {
              window.open(`/api/custom-admin/${collectionSlug}/example`, '_blank')
            }}
          >
            See Example
          </p>
        </div>
        {!isCreateMode && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
            Record ID: {recordId} | Locale: {locale}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ paddingBottom: '100px' }}>
        {error && (
          <div
            style={{
              marginBottom: 16,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#b91c1c',
              fontSize: 14,
            }}
            role="alert"
          >
            {error}
          </div>
        )}
        {layout ? (
          <div
            className={layout.columns === 2 ? 'two-column-layout' : 'single-column-layout'}
            style={{
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {layout.left.map((section) =>
                renderSection(section.title, section.fields, section.description, section.wrap),
              )}
            </div>
            {layout.right && layout.right.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {layout.right.map((section) =>
                  renderSection(section.title, section.fields, section.description, section.wrap),
                )}
              </div>
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
                fieldError={fieldErrors[field.name]}
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
              backgroundColor: saving ? '#f3e8c7' : '#6b5526',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#6b5526'
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#6b5526'
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
