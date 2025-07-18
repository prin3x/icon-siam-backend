import type { NextRequest } from 'next/server'

// Extend PayloadRequest type to include apiKeyUser
declare global {
  namespace Express {
    interface Request {
      apiKeyUser?: any
    }
  }
}

export interface ApiKeyUser {
  name: string
  collections: string[]
  type: 'api-key' | 'internal'
}

export async function validateApiKey(req: NextRequest): Promise<ApiKeyUser | null> {
  try {
    // For internal requests (same origin), allow without API key
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const appUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
    const isInternalRequest =
      !origin || origin === appUrl || (referer && referer.startsWith(appUrl))

    // If it's an internal request, allow access
    if (isInternalRequest) {
      return {
        name: 'Internal App',
        collections: ['*'],
        type: 'internal',
      }
    }

    // if pathname include /authenticated, return null
    if (req.nextUrl.pathname.includes('/authenticated')) {
      return {
        name: 'Frontend App',
        collections: ['*'],
        type: 'api-key',
      }
    }

    // For external requests, require API key
    const authHeader = req.headers.get('authorization')
    const apiKeyHeader = req.headers.get('x-api-key')

    let apiKey: string | null = null

    // Check Bearer token format
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7)
    }
    // Check X-API-Key header
    else if (apiKeyHeader) {
      apiKey = apiKeyHeader
    }

    if (!apiKey) {
      return null
    }

    // Get API key from environment variable
    const validApiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY

    if (!validApiKey || apiKey !== validApiKey) {
      return null
    }

    // Get allowed collections from environment variable (comma-separated)
    const allowedCollections = process.env.API_ALLOWED_COLLECTIONS || '*'
    const collections =
      allowedCollections === '*' ? ['*'] : allowedCollections.split(',').map((c) => c.trim())

    return {
      name: 'External App',
      collections: collections,
      type: 'api-key',
    }
  } catch (error) {
    console.error('API key validation error:', error)
    return null
  }
}

export function hasCollectionAccess(apiKeyUser: ApiKeyUser, collection: string): boolean {
  // Check if user has access to the collection
  return apiKeyUser.collections.includes('*') || apiKeyUser.collections.includes(collection)
}

export function extendRequestWithApiKey(req: any, apiKeyUser: ApiKeyUser): void {
  // Add API key user to the request object
  req.apiKeyUser = apiKeyUser
}
