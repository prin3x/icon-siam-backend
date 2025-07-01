import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import {
  validateApiKey,
  hasCollectionAccess,
  extendRequestWithApiKey,
} from '@/middleware/apiKeyAuth'
import { REST_GET, REST_OPTIONS } from '@payloadcms/next/routes'

// Add CORS headers
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

async function handleAuthenticatedRequest(
  request: Request,
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

// Only allow GET requests for read-only access
export const GET = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  return handleAuthenticatedRequest(request, args, REST_GET(config))
}

export const OPTIONS = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
