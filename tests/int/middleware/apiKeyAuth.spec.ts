import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateApiKey, hasCollectionAccess } from '@/middleware/apiKeyAuth'

class MockNextRequest {
  headers: Headers
  nextUrl: { pathname: string }
  constructor(headers: Record<string, string> = {}, pathname = '/') {
    this.headers = new Headers(headers)
    this.nextUrl = { pathname }
  }
}

const originalEnv = { ...process.env }

describe('apiKeyAuth', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  it('allows internal requests without api key', async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'
    const req = new MockNextRequest({ origin: 'http://localhost:3001' }) as any
    const user = await validateApiKey(req)
    expect(hasCollectionAccess(user!, 'anything')).toBe(true)
  })

  it('allows authenticated path without api key', async () => {
    const req = new MockNextRequest({}, '/authenticated/health') as any
    const user = await validateApiKey(req)
    expect(hasCollectionAccess(user!, 'promotions')).toBe(true)
  })

  it('rejects when external without key', async () => {
    const req = new MockNextRequest({ origin: 'https://external.com' }) as any
    const user = await validateApiKey(req)
    expect(user).toBeNull()
  })

  it('accepts when key matches env and respects collections', async () => {
    process.env.API_KEY = 'secret'
    process.env.API_ALLOWED_COLLECTIONS = 'events,promotions'
    const req = new MockNextRequest(
      {
        origin: 'https://external.com',
        authorization: 'Bearer secret',
      },
      '/',
    ) as any
    const user = await validateApiKey(req)
    expect(hasCollectionAccess(user!, 'events')).toBe(true)
    expect(hasCollectionAccess(user!, 'shops')).toBe(false)
  })
})
