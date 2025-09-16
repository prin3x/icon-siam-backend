import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { handleAuthenticatedRequest } from '@/utilities/authHandler'
import { addCorsHeaders } from '@/utilities/corsUtils'

// Handle schema requests
async function handleSchemaRequest(request: NextRequest, collectionSlug: string) {
  try {
    const payload = await getPayload({ config })
    const collection = (payload.collections as any)[collectionSlug]

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (!collection.config?.fields || !Array.isArray(collection.config.fields)) {
      console.log('No fields found in collection')
      return NextResponse.json({ fields: [] })
    }

    // Extract field schema - include all field types
    const fields = collection.config.fields.map((field: any) => {
      // Map PayloadCMS field types to our form field types
      let formType = field.type

      // Handle specific field type mappings
      if (field.type === 'richText') formType = 'richText'
      if (field.type === 'email') formType = 'text'
      if (field.type === 'number') formType = 'text'
      if (field.type === 'date') formType = 'date'
      if (field.type === 'checkbox') formType = 'checkbox'
      if (field.type === 'select') formType = 'select'
      if (field.type === 'radioGroup') formType = 'select'
      // Keep as 'upload' so the FieldRenderer can render ImageUpload correctly
      if (field.type === 'upload') formType = 'upload'
      if (field.type === 'media') formType = 'upload'
      if (field.type === 'relationship') formType = 'relationship'
      if (field.type === 'array') formType = 'array'
      if (field.type === 'group') formType = 'group'
      if (field.type === 'tabs') formType = 'tabs'
      if (field.type === 'row') formType = 'row'
      if (field.type === 'collapsible') formType = 'collapsible'

      // Only use ComboBox when explicitly opted-in on the field
      if (field.type === 'text') {
        if (field?.admin?.useComboBox === true) {
          formType = 'comboBox'
        }
      }

      // Generate options for ComboBox fields based on field name/type
      let generatedOptions: Array<{ label: string; value: string }> = []

      if (formType === 'comboBox') {
        const fieldName = field.name.toLowerCase()
        const fieldLabel = (field.label || field.name).toLowerCase()

        // Generate options based on field patterns
        if (fieldName.includes('zone') || fieldLabel.includes('zone')) {
          generatedOptions = [
            { label: 'Zone A', value: 'zone-a' },
            { label: 'Zone B', value: 'zone-b' },
            { label: 'Zone C', value: 'zone-c' },
            { label: 'Zone D', value: 'zone-d' },
            { label: 'Zone E', value: 'zone-e' },
          ]
        } else if (fieldName.includes('floor') || fieldLabel.includes('floor')) {
          generatedOptions = [
            { label: 'Ground Floor', value: 'ground' },
            { label: '1st Floor', value: '1st' },
            { label: '2nd Floor', value: '2nd' },
            { label: '3rd Floor', value: '3rd' },
            { label: '4th Floor', value: '4th' },
            { label: '5th Floor', value: '5th' },
          ]
        } else if (fieldName.includes('status') || fieldLabel.includes('status')) {
          generatedOptions = [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ]
        } else if (fieldName.includes('type') || fieldLabel.includes('type')) {
          generatedOptions = [
            { label: 'Standard', value: 'standard' },
            { label: 'Premium', value: 'premium' },
            { label: 'VIP', value: 'vip' },
            { label: 'Special', value: 'special' },
          ]
        } else if (fieldName.includes('category') || fieldLabel.includes('category')) {
          generatedOptions = [
            { label: 'Fashion', value: 'fashion' },
            { label: 'Electronics', value: 'electronics' },
            { label: 'Food & Beverage', value: 'food-beverage' },
            { label: 'Beauty', value: 'beauty' },
            { label: 'Home & Living', value: 'home-living' },
            { label: 'Sports', value: 'sports' },
          ]
        }
      }

      // Normalize any options array to {label, value}
      const normalizeOptions = (input: any): Array<{ label: string; value: string }> => {
        if (!input) return []
        const arr = Array.isArray(input) ? input : []
        const toTitle = (s: string) =>
          s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return arr.map((opt: any) => {
          if (typeof opt === 'string') {
            return { label: toTitle(opt), value: opt }
          }
          if (opt && typeof opt === 'object') {
            const value = String('value' in opt ? opt.value : (opt.id ?? opt.key ?? ''))
            const label = String(opt.label ?? (value ? toTitle(value) : ''))
            return { label, value }
          }
          const str = String(opt)
          return { label: toTitle(str), value: str }
        })
      }

      return {
        name: field.name,
        type: formType,
        label: field.label || field.name,
        required: field.required || false,
        localized: field.localized || false,
        options:
          formType === 'select'
            ? normalizeOptions(field.options || field.choices)
            : generatedOptions,
        defaultValue: field.defaultValue,
        admin: field.admin || {},
        filterOptions: field.filterOptions || undefined,
        // Add relationship-specific properties
        relationTo: field.relationTo,
        hasMany: field.hasMany || false,
        // Add array-specific properties
        fields: field.fields,
        hidden: field.hidden || false,
      }
    })

    const adminDefaultColumns =
      (collection.config?.admin && Array.isArray(collection.config.admin.defaultColumns)
        ? collection.config.admin.defaultColumns
        : []) || []
    const adminUseAsTitle = collection.config?.admin?.useAsTitle

    return NextResponse.json({
      fields,
      admin: { defaultColumns: adminDefaultColumns, useAsTitle: adminUseAsTitle },
    })
  } catch (error) {
    console.error('Error fetching schema:', error)
    return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 })
  }
}

// Handle POST requests for creating records
async function handleCreateRequest(request: NextRequest, collectionSlug: string) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const result = await payload.create({
      collection: collectionSlug as any,
      data: body,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error creating record:', error)
    return NextResponse.json({ error: error.message || 'Failed to create record' }, { status: 400 })
  }
}

// Handle PATCH requests for updating records
async function handleUpdateRequest(request: NextRequest, collectionSlug: string, recordId: string) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const result = await payload.update({
      collection: collectionSlug as any,
      id: recordId,
      data: body,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error updating record:', error)
    return NextResponse.json({ error: error.message || 'Failed to update record' }, { status: 400 })
  }
}

// Handle DELETE requests for deleting records
async function handleDeleteRequest(request: NextRequest, collectionSlug: string, recordId: string) {
  try {
    const payload = await getPayload({ config })

    const result = await payload.delete({
      collection: collectionSlug as any,
      id: recordId,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error deleting record:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete record' }, { status: 400 })
  }
}

// Handle GET requests for schema
export const GET = async (request: NextRequest, args: { params: Promise<{ slug: string[] }> }) => {
  console.log('request', request)
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 1]

  // Check if this is a schema request
  if (url.searchParams.get('schema') === 'true') {
    return handleAuthenticatedRequest(
      request,
      args,
      async () => {
        return handleSchemaRequest(request, collectionSlug)
      },
      { allowedMethods: 'GET, POST, PATCH, DELETE, OPTIONS' },
    )
  }

  return NextResponse.json({ error: 'Method not allowedsss' }, { status: 405 })
}

// Handle POST requests for creating records
export const POST = async (request: NextRequest, args: { params: Promise<{ slug: string[] }> }) => {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 1]

  return handleAuthenticatedRequest(
    request,
    args,
    async () => {
      return handleCreateRequest(request, collectionSlug)
    },
    { allowedMethods: 'GET, POST, PATCH, DELETE, OPTIONS' },
  )
}

// Handle PATCH requests for updating records
export const PATCH = async (
  request: NextRequest,
  args: { params: Promise<{ slug: string[] }> },
) => {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 2] // Second to last segment
  const recordId = pathSegments[pathSegments.length - 1] // Last segment

  return handleAuthenticatedRequest(
    request,
    args,
    async () => {
      return handleUpdateRequest(request, collectionSlug, recordId)
    },
    { allowedMethods: 'GET, POST, PATCH, DELETE, OPTIONS' },
  )
}

// Handle DELETE requests for deleting records
export const DELETE = async (
  request: NextRequest,
  args: { params: Promise<{ slug: string[] }> },
) => {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 2] // Second to last segment
  const recordId = pathSegments[pathSegments.length - 1] // Last segment

  return handleAuthenticatedRequest(
    request,
    args,
    async () => {
      return handleDeleteRequest(request, collectionSlug, recordId)
    },
    { allowedMethods: 'GET, POST, PATCH, DELETE, OPTIONS' },
  )
}

export const OPTIONS = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response, { allowedMethods: 'GET, POST, PATCH, DELETE, OPTIONS' })
}
