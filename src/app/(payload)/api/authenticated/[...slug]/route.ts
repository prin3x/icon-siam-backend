import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import {
  validateApiKey,
  hasCollectionAccess,
  extendRequestWithApiKey,
} from '@/middleware/apiKeyAuth'
import { REST_GET, REST_OPTIONS } from '@payloadcms/next/routes'

async function handleAuthenticatedRequest(
  request: Request,
  args: { params: Promise<{ slug: string[] }> },
  handler: (request: Request, args: { params: Promise<{ slug: string[] }> }) => Promise<Response>,
) {
  try {
    // Validate API key
    const apiKeyUser = await validateApiKey(request)

    if (!apiKeyUser) {
      return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
    }

    // Extract collection from URL path
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const collectionSlug = pathSegments[pathSegments.length - 1] // Get the last segment

    // Check collection access
    if (!hasCollectionAccess(apiKeyUser, collectionSlug)) {
      return NextResponse.json({ error: 'Access denied to this collection' }, { status: 403 })
    }

    // Extend request with API key user info
    const extendedReq = request as any
    extendRequestWithApiKey(extendedReq, apiKeyUser)

    // Call the original handler
    return await handler(extendedReq, args)
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

// Only allow GET requests for read-only access
export const GET = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  return handleAuthenticatedRequest(request, args, REST_GET(config))
}

export const OPTIONS = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  return handleAuthenticatedRequest(request, args, REST_OPTIONS(config))
}
