import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateApiKey,
  hasCollectionAccess,
  extendRequestWithApiKey,
} from '@/middleware/apiKeyAuth'

class MockNextRequest {
  headers: Headers
  nextUrl: { pathname: string }
  constructor(headers: Record<string, string> = {}, pathname = '/') {
    this.headers = new Headers(headers)
    this.nextUrl = { pathname }
  }
}

const originalEnv = { ...process.env }

describe('apiKeyAuth (more)', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  it('treats referer from internal app as internal', async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'
    const req = new MockNextRequest({ referer: 'http://localhost:3001/admin' }) as any
    const user = await validateApiKey(req)
    expect(user?.type).toBe('internal')
    expect(hasCollectionAccess(user!, 'anything')).toBe(true)
  })

  it('rejects when api key provided but mismatched', async () => {
    process.env.API_KEY = 'expected'
    const req = new MockNextRequest({ origin: 'https://ext', authorization: 'Bearer wrong' }) as any
    const user = await validateApiKey(req)
    expect(user).toBeNull()
  })

  it('grants wildcard collections when env is *', async () => {
    process.env.API_KEY = 'secret'
    process.env.API_ALLOWED_COLLECTIONS = '*'
    const req = new MockNextRequest({ origin: 'https://ext', 'x-api-key': 'secret' }) as any
    const user = await validateApiKey(req)
    expect(user?.collections).toEqual(['*'])
    expect(hasCollectionAccess(user!, 'anything')).toBe(true)
  })

  it('extendRequestWithApiKey sets apiKeyUser', () => {
    const req: any = {}
    extendRequestWithApiKey(req, { name: 'N', collections: ['shops'], type: 'api-key' })
    expect(req.apiKeyUser).toBeTruthy()
    expect(req.apiKeyUser.collections).toEqual(['shops'])
  })
})
