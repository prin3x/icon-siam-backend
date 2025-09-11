import { describe, it, expect } from 'vitest'
import { validateApiKey, extendRequestWithApiKey } from '@/middleware/apiKeyAuth'

class MockNextRequest {
  headers: Headers
  nextUrl: { pathname: string }
  constructor(headers: Record<string, string> = {}, pathname = '/') {
    this.headers = new Headers(headers)
    this.nextUrl = { pathname }
  }
}

describe('apiKeyAuth headers', () => {
  it('accepts x-api-key header', async () => {
    process.env.API_KEY = 'secret'
    const req = new MockNextRequest({ origin: 'https://external', 'x-api-key': 'secret' }) as any
    const user = await validateApiKey(req)
    expect(user?.type).toBe('api-key')
  })

  it('extendRequestWithApiKey attaches user', () => {
    const req: any = {}
    extendRequestWithApiKey(req, { name: 'X', collections: ['*'], type: 'api-key' })
    expect(req.apiKeyUser).toBeTruthy()
    expect(req.apiKeyUser.name).toBe('X')
  })
})
