import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  )
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

async function handleGlobalSchemaRequest(request: NextRequest, globalSlug: string) {
  try {
    const resolvedConfig = await getPayload({ config })
    const globalConfig = resolvedConfig.config.globals.find(
      (g: { slug: string }) => g.slug === globalSlug,
    )

    if (!globalConfig) {
      return NextResponse.json({ error: 'Global not found' }, { status: 404 })
    }

    if (!globalConfig.fields || !Array.isArray(globalConfig.fields)) {
      return NextResponse.json({ fields: [] })
    }

    const fields = globalConfig.fields.map((field: any) => {
      let formType = field.type
      if (field.type === 'richText') formType = 'richText'
      if (field.type === 'email') formType = 'text'
      if (field.type === 'number') formType = 'text'
      if (field.type === 'date') formType = 'date'
      if (field.type === 'checkbox') formType = 'checkbox'
      if (field.type === 'select') formType = 'select'
      if (field.type === 'radioGroup') formType = 'select'
      if (field.type === 'upload') formType = 'image'
      if (field.type === 'media') formType = 'image'
      if (field.type === 'relationship') formType = 'relationship'
      if (field.type === 'array') formType = 'array'
      if (field.type === 'group') formType = 'group'
      if (field.type === 'tabs') formType = 'tabs'
      if (field.type === 'row') formType = 'row'
      if (field.type === 'collapsible') formType = 'collapsible'

      return {
        name: field.name,
        type: formType,
        label: field.label || field.name,
        required: field.required || false,
        localized: field.localized || false,
        options: field.options || field.choices,
        defaultValue: field.defaultValue,
        admin: field.admin || {},
        relationTo: field.relationTo,
        hasMany: field.hasMany || false,
        fields: field.fields,
      }
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Error fetching global schema:', error)
    return NextResponse.json({ error: 'Failed to fetch global schema' }, { status: 500 })
  }
}

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> => {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  if (searchParams.get('schema') === 'true') {
    const response = await handleGlobalSchemaRequest(request, slug)
    return addCorsHeaders(response)
  }

  return addCorsHeaders(NextResponse.json({ error: 'Method not allowed' }, { status: 405 }))
}

export const OPTIONS = async (request: Request): Promise<NextResponse> => {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
