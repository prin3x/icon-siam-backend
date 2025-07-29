'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from './LocaleContext'
import { FieldRenderer } from './FieldRenderer'

interface RecordEditFormProps {
  collectionSlug?: string
  globalSlug?: string
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

export function RecordEditForm({ collectionSlug, globalSlug, recordId }: RecordEditFormProps) {
  const router = useRouter()
  const { locale } = useLocale()
  const [record, setRecord] = useState<any>(null)
  const [schema, setSchema] = useState<FieldSchema[]>([])
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const isGlobalMode = Boolean(globalSlug)
  const isCreateMode = !recordId && !isGlobalMode
  const slug = globalSlug || collectionSlug

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchRecordAndSchema = async () => {
      try {
        setLoading(true)
        setError('')

        const schemaUrl = isGlobalMode
          ? `/api/admin/globals/${globalSlug}?schema=true&locale=${locale}`
          : `/api/admin/${collectionSlug}?schema=true&locale=${locale}`

        console.log(schemaUrl, 'schemaUrl')

        const schemaResponse = await fetch(schemaUrl, { signal })
        console.log('schemaResponse', schemaResponse)

        if (!signal.aborted && !schemaResponse.ok) {
          throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`)
        }

        const schemaData = await schemaResponse.json()
        if (signal.aborted) return
        setSchema(schemaData.fields || [])

        if (isCreateMode) {
          const initialFormData: any = {}
          schemaData.fields?.forEach((field: FieldSchema) => {
            initialFormData[field.name] = field.defaultValue || ''
          })
          setFormData(initialFormData)
        } else {
          const dataUrl = isGlobalMode
            ? `/api/custom-admin/${globalSlug}?locale=${locale}&depth=3`
            : `/api/custom-admin/${collectionSlug}/${recordId}?locale=${locale}&depth=3`

          const recordResponse = await fetch(dataUrl, { signal })

          if (!signal.aborted && !recordResponse.ok) {
            throw new Error(`Failed to fetch record: ${recordResponse.statusText}`)
          }

          const recordData = await recordResponse.json()
          if (signal.aborted) return
          setRecord(recordData)

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

    if (slug) {
      fetchRecordAndSchema()
    }

    return () => {
      controller.abort()
    }
  }, [slug, recordId, locale, isCreateMode, isGlobalMode, collectionSlug, globalSlug])

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
            acc[key] = anyValue.id
          } else {
            acc[key] = value
          }
        }
        return acc
      }, {} as any)

      let url: string
      let method: 'POST' | 'PATCH'

      if (isGlobalMode) {
        url = `/api/custom-admin/${globalSlug}?locale=${locale}`
        method = 'POST' // Globals are always a POST/update
      } else {
        url = isCreateMode
          ? `/api/custom-admin/${collectionSlug}?locale=${locale}`
          : `/api/custom-admin/${collectionSlug}/${recordId}?locale=${locale}`
        method = isCreateMode ? 'POST' : 'PATCH'
      }

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

      const redirectUrl = isGlobalMode
        ? '/custom-admin'
        : `/custom-admin/collections/${collectionSlug}`
      router.push(redirectUrl)
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

  const title = isGlobalMode
    ? `Edit ${globalSlug}`
    : isCreateMode
      ? `Create New ${collectionSlug}`
      : `Edit ${collectionSlug} Record`

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
          {title}
        </h1>
        {!isCreateMode && !isGlobalMode && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
            Record ID: {recordId} | Locale: {locale}
          </p>
        )}
        {isGlobalMode && (
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Locale: {locale}</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingBottom: '100px',
        }}
      >
        {schema.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            formData={formData}
            handleInputChange={handleInputChange}
          />
        ))}
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
              router.push(
                isGlobalMode ? '/custom-admin' : `/custom-admin/collections/${collectionSlug}`,
              )
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
