import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  generateApiKey,
  isValidApiKeyFormat,
  extractApiKeyFromHeaders,
  getApiHeaders,
  isBrowser,
  isInternalRequest,
} from '@/utilities/apiKeyUtils'

const ORIGINAL_ENV = { ...process.env }

describe('apiKeyUtils', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('generateApiKey creates a pk_ prefixed 67-char key and validates format', () => {
    const key = generateApiKey()
    expect(key.startsWith('pk_')).toBe(true)
    expect(key.length).toBe(67)
    expect(isValidApiKeyFormat(key)).toBe(true)
  })

  it('isValidApiKeyFormat returns false for invalid formats', () => {
    expect(isValidApiKeyFormat('pk_short')).toBe(false)
    expect(isValidApiKeyFormat('no_prefix_'.padEnd(67, 'a'))).toBe(false)
    expect(isValidApiKeyFormat('pk_'.padEnd(66, 'a'))).toBe(false)
  })

  it('extractApiKeyFromHeaders handles Bearer and x-api-key', () => {
    const h1 = new Headers({ authorization: 'Bearer abc' })
    expect(extractApiKeyFromHeaders(h1)).toBe('abc')

    const h2 = new Headers({ 'x-api-key': 'xyz' })
    expect(extractApiKeyFromHeaders(h2)).toBe('xyz')

    const h3 = new Headers()
    expect(extractApiKeyFromHeaders(h3)).toBeNull()
  })

  it('getApiHeaders builds JSON headers and includes api key when requested', () => {
    // default json header
    const base = getApiHeaders()
    expect(base['Content-Type']).toBe('application/json')
    expect(base['x-api-key']).toBeUndefined()

    // do not set content-type for form data
    const form = getApiHeaders(false, true)
    expect(form['Content-Type']).toBeUndefined()

    // include api key when env present
    process.env.NEXT_PUBLIC_API_KEY = 'public-key'
    const withKey = getApiHeaders(true)
    expect(withKey['x-api-key']).toBe('public-key')
  })

  it('isBrowser reflects jsdom environment', () => {
    expect(isBrowser()).toBe(true)
  })

  it('isInternalRequest checks against NEXT_PUBLIC_SERVER_URL and localhost', () => {
    // match app url
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3001'),
      writable: true,
      configurable: true,
    })
    expect(isInternalRequest()).toBe(true)

    // different localhost port
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:9999'),
      writable: true,
      configurable: true,
    })
    expect(isInternalRequest()).toBe(true)

    // external origin
    Object.defineProperty(window, 'location', {
      value: new URL('https://external.com'),
      writable: true,
      configurable: true,
    })
    expect(isInternalRequest()).toBe(false)
  })
})
