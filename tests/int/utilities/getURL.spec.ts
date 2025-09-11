import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getServerSideURL, getClientSideURL } from '@/utilities/getURL'

const ORIGINAL_ENV = { ...process.env }

describe('getURL', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns env NEXT_PUBLIC_SERVER_URL when set', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://example.com'
    expect(getServerSideURL()).toBe('https://example.com')
  })

  it('falls back to localhost:3001 when env not set', () => {
    delete process.env.NEXT_PUBLIC_SERVER_URL
    expect(getServerSideURL()).toBe('http://localhost:3001')
  })

  it('getClientSideURL is currently empty implementation', () => {
    expect(getClientSideURL).toBeInstanceOf(Function)
    // @ts-expect-error current function returns undefined
    expect(getClientSideURL()).toBeUndefined()
  })
})
