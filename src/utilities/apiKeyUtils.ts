import crypto from 'crypto'

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  return `pk_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith('pk_') && key.length === 67 // pk_ + 64 hex characters
}

/**
 * Extract API key from various header formats
 */
export function extractApiKeyFromHeaders(headers: Headers): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = headers.get('x-api-key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  return null
}

/**
 * Create API key usage statistics
 */
export interface ApiKeyUsage {
  keyId: string
  keyName: string
  lastUsed: Date
  requestCount: number
  collections: string[]
  permissions: string[]
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

/**
 * Default rate limiting configuration
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requests per 15 minutes
}

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(
  keyId: string,
  currentTime: number,
  rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMIT,
): boolean {
  // This is a simple implementation
  // In production, you'd want to use Redis or a similar store
  // to track rate limits across multiple server instances

  // For now, we'll return true (allow request)
  // You can implement proper rate limiting logic here
  return true
}
