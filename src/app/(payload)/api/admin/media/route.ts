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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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
  handler: (request: Request) => Promise<Response>,
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

    // Check media collection access
    if (!hasCollectionAccess(apiKeyUser, 'media')) {
      const errorResponse = NextResponse.json(
        { error: 'Access denied to media collection' },
        { status: 403 },
      )
      return addCorsHeaders(errorResponse)
    }

    // Extend request with API key user info
    const extendedReq = request as any
    extendRequestWithApiKey(extendedReq, apiKeyUser)

    // Call the original handler
    const response = await handler(extendedReq)

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

// Handle POST requests for uploading media
async function handleMediaUpload(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Parse the form data
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      try {
        // Convert File to Buffer for PayloadCMS
        const buffer = Buffer.from(await file.arrayBuffer())

        const result = await payload.create({
          collection: 'media' as any,
          data: {
            alt: file.name, // Use filename as alt text
          },
          file: {
            data: buffer,
            filename: file.name,
            mimeType: file.type,
          } as any,
        })

        uploadedFiles.push({
          id: result.id,
          filename: result.filename,
          url: result.url,
          alt: result.alt,
          width: result.width,
          height: result.height,
        })
      } catch (error: any) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${error.message}` },
          { status: 400 },
        )
      }
    }

    // Return single file if only one uploaded, otherwise return array
    const response = uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 400 })
  }
}

// Handle POST requests for uploading media
export const POST = async (request: NextRequest) => {
  return handleAuthenticatedRequest(request, async () => {
    return handleMediaUpload(request)
  })
}

export const OPTIONS = async (request: Request) => {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
