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
