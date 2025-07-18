import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import {
  validateApiKey,
  hasCollectionAccess,
  extendRequestWithApiKey,
} from '@/middleware/apiKeyAuth'
import { getPayload } from 'payload'

// Add CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  )
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  // Security headers
  response.headers.set('Content-Security-Policy', "default-src 'self'")
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

async function handleAuthenticatedRequest(
  request: NextRequest,
  args: { params: Promise<{ slug: string[] }> },
  handler: (request: Request, args: { params: Promise<{ slug: string[] }> }) => Promise<Response>,
) {
  try {
    // Validate API key
    const apiKeyUser = await validateApiKey(request)

    if (!apiKeyUser) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      )
      return addCorsHeaders(errorResponse)
    }

    // Extract collection from URL path
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const collectionSlug = pathSegments[pathSegments.length - 1] // Get the last segment

    // Check collection access
    if (!hasCollectionAccess(apiKeyUser, collectionSlug)) {
      const errorResponse = NextResponse.json(
        { error: 'Access denied to this collection' },
        { status: 403 },
      )
      return addCorsHeaders(errorResponse)
    }

    // Extend request with API key user info
    const extendedReq = request as any
    extendRequestWithApiKey(extendedReq, apiKeyUser)

    // Call the original handler
    const response = await handler(extendedReq, args)

    // Add CORS headers to the response
    if (response instanceof NextResponse) {
      return addCorsHeaders(response)
    }

    // If it's a regular Response, convert it to NextResponse and add CORS headers
    const nextResponse = NextResponse.json(await response.json(), { status: response.status })
    return addCorsHeaders(nextResponse)
  } catch (error) {
    console.error('Authentication error:', error)
    const errorResponse = NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    return addCorsHeaders(errorResponse)
  }
}

// Handle schema requests
async function handleSchemaRequest(request: NextRequest, collectionSlug: string) {
  try {
    const payload = await getPayload({ config })
    const collection = (payload.collections as any)[collectionSlug]

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Extract field schema - include media fields but exclude other complex types
    const fields = collection.fields
      .filter((field: any) => {
        // Exclude certain complex field types but include media
        const excludedTypes = ['relationship', 'array', 'group', 'tabs', 'row', 'collapsible']
        return !excludedTypes.includes(field.type)
      })
      .map((field: any) => {
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
        if (field.type === 'upload') formType = 'image'
        if (field.type === 'media') formType = 'image'

        // Detect fields that should use ComboBox (text fields with common patterns)
        if (field.type === 'text') {
          const fieldName = field.name.toLowerCase()
          const fieldLabel = (field.label || field.name).toLowerCase()

          // Common patterns that suggest predefined options
          const comboBoxPatterns = [
            'zone',
            'area',
            'region',
            'location',
            'category',
            'type',
            'status',
            'level',
            'floor',
            'section',
            'department',
            'division',
            'group',
            'brand',
            'model',
            'version',
            'size',
            'color',
            'material',
          ]

          if (
            comboBoxPatterns.some(
              (pattern) => fieldName.includes(pattern) || fieldLabel.includes(pattern),
            )
          ) {
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

        return {
          name: field.name,
          type: formType,
          label: field.label || field.name,
          required: field.required || false,
          localized: field.localized || false,
          options: field.options || field.choices || generatedOptions,
          defaultValue: field.defaultValue,
          admin: field.admin || {},
        }
      })

    return NextResponse.json({ fields })
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
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 1]

  // Check if this is a schema request
  if (url.searchParams.get('schema') === 'true') {
    return handleAuthenticatedRequest(request, args, async () => {
      return handleSchemaRequest(request, collectionSlug)
    })
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

// Handle POST requests for creating records
export const POST = async (request: NextRequest, args: { params: Promise<{ slug: string[] }> }) => {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const collectionSlug = pathSegments[pathSegments.length - 1]

  return handleAuthenticatedRequest(request, args, async () => {
    return handleCreateRequest(request, collectionSlug)
  })
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

  return handleAuthenticatedRequest(request, args, async () => {
    return handleUpdateRequest(request, collectionSlug, recordId)
  })
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

  return handleAuthenticatedRequest(request, args, async () => {
    return handleDeleteRequest(request, collectionSlug, recordId)
  })
}

export const OPTIONS = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
