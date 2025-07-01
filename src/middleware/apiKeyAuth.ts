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
  type: 'api-key'
}

export async function validateApiKey(req: Request): Promise<ApiKeyUser | null> {
  try {
    // Check for API key in headers
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
      name: 'Frontend App',
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
