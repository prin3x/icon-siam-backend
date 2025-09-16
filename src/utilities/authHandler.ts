import { NextRequest, NextResponse } from 'next/server'
import {
  extendRequestWithApiKey,
  hasCollectionAccess,
  validateApiKey,
} from '@/middleware/apiKeyAuth'
import { addCorsHeaders } from './corsUtils'

export async function handleAuthenticatedRequest(
  request: NextRequest,
  args: { params: Promise<{ slug: string[] }> },
  handler: (request: Request, args: { params: Promise<{ slug: string[] }> }) => Promise<Response>,
  corsOptions?: { allowedMethods?: string; allowedHeaders?: string },
) {
  try {
    // Validate API key
    const apiKeyUser = await validateApiKey(request)

    if (!apiKeyUser) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      )
      return addCorsHeaders(errorResponse, corsOptions)
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
      return addCorsHeaders(errorResponse, corsOptions)
    }

    // Extend request with API key user info
    const extendedReq = request as any
    extendRequestWithApiKey(extendedReq, apiKeyUser)

    // Call the original handler
    const response = await handler(extendedReq, args)

    // Add CORS headers to the response
    if (response instanceof NextResponse) {
      return addCorsHeaders(response, corsOptions)
    }

    // If it's a regular Response, convert it to NextResponse and add CORS headers
    const nextResponse = NextResponse.json(await response.json(), { status: response.status })
    return addCorsHeaders(nextResponse, corsOptions)
  } catch (error) {
    console.error('Authentication error:', error)
    const errorResponse = NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    return addCorsHeaders(errorResponse, corsOptions)
  }
}
