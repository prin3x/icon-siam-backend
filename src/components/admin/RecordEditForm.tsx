'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApiHeaders, isInternalRequest } from '@/utilities/apiKeyUtils'
import { useLocale } from './LocaleContext'
import { FieldRenderer } from './FieldRenderer'

interface RecordEditFormProps {
  collectionSlug: string
  recordId: string
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

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch record data
        const recordResponse = await fetch(
          `/api/authenticated/${collectionSlug}/${recordId}?locale=${locale}&depth=2`,
          {
            headers: getApiHeaders(!isInternalRequest()),
          },
        )

        if (!recordResponse.ok) {
          throw new Error(`Failed to fetch record: ${recordResponse.statusText}`)
        }

        const recordData = await recordResponse.json()
        setRecord(recordData)

        // Fetch schema
        const schemaResponse = await fetch(
          `/api/admin/${collectionSlug}?schema=true&locale=${locale}`,
          {
            headers: getApiHeaders(!isInternalRequest()),
          },
        )

        if (!schemaResponse.ok) {
          throw new Error(`Failed to fetch schema: ${schemaResponse.statusText}`)
        }

        const schemaData = await schemaResponse.json()
        setSchema(schemaData.fields || [])

        // Initialize form data
        const initialFormData: any = {}
        schemaData.fields?.forEach((field: FieldSchema) => {
          initialFormData[field.name] = recordData[field.name] || field.defaultValue || ''
        })
        setFormData(initialFormData)
      } catch (error: any) {
        console.error('Error fetching record:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (collectionSlug && recordId) {
      fetchRecord()
    }
  }, [collectionSlug, recordId, locale])

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

      const response = await fetch(`/api/authenticated/${collectionSlug}/${recordId}`, {
        method: 'PATCH',
        headers: {
          ...getApiHeaders(!isInternalRequest()),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to update record: ${errorData}`)
      }

      // Redirect back to collection page
      router.push(`/custom-admin/collections/${collectionSlug}`)
    } catch (error: any) {
      console.error('Error updating record:', error)
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
          Edit {collectionSlug} Record
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Record ID: {recordId} | Locale: {locale}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
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
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
            marginTop: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => router.push(`/custom-admin/collections/${collectionSlug}`)}
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
