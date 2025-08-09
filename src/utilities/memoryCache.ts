import type { Config } from 'src/payload-types'

// Cache entry interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// Cache configuration
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
  VERY_LONG: 604800, // 7 days
}

// Collection-specific cache TTLs
const COLLECTION_CACHE_TTL: Record<string, number> = {
  homepage: CACHE_TTL.MEDIUM,
  events: CACHE_TTL.SHORT,
  promotions: CACHE_TTL.SHORT,
  shops: CACHE_TTL.LONG,
  dinings: CACHE_TTL.LONG,
  attractions: CACHE_TTL.LONG,
  media: CACHE_TTL.VERY_LONG,
  categories: CACHE_TTL.LONG,
  floors: CACHE_TTL.LONG,
  footers: CACHE_TTL.LONG,
  stickbar: CACHE_TTL.LONG,
  newsPress: CACHE_TTL.SHORT,
  stories: CACHE_TTL.MEDIUM,
  facilities: CACHE_TTL.LONG,
  aboutIconsiam: CACHE_TTL.LONG,
  boardOfDirectors: CACHE_TTL.LONG,
  iconsiamAwards: CACHE_TTL.LONG,
  visionMission: CACHE_TTL.LONG,
  residences: CACHE_TTL.LONG,
}

// Cache key generators
export const generateCacheKey = {
  document: (collection: string, id: string, locale?: string) =>
    `doc:${collection}:${id}${locale ? `:${locale}` : ''}`,

  documentBySlug: (collection: string, slug: string, locale?: string) =>
    `doc:${collection}:slug:${slug}${locale ? `:${locale}` : ''}`,

  collectionList: (collection: string, params: Record<string, any>) =>
    `list:${collection}:${JSON.stringify(params)}`,

  global: (slug: string, locale?: string) => `global:${slug}${locale ? `:${locale}` : ''}`,

  media: (id: string) => `media:${id}`,

  apiResponse: (endpoint: string, params: Record<string, any>) =>
    `api:${endpoint}:${JSON.stringify(params)}`,
}

// In-memory cache store
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000) // Cleanup every minute
  }

  // Get cached data
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Set cached data with TTL
  set(key: string, data: any, ttl: number = CACHE_TTL.MEDIUM): void {
    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    })
  }

  // Delete specific cache key
  delete(key: string): void {
    this.cache.delete(key)
  }

  // Invalidate all cache keys matching pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Invalidate collection cache
  invalidateCollection(collection: string): void {
    this.invalidatePattern(`*:${collection}:*`)
    this.invalidatePattern(`list:${collection}:*`)
  }

  // Invalidate document cache
  invalidateDocument(collection: string, id: string): void {
    this.invalidatePattern(`doc:${collection}:${id}*`)
    this.invalidatePattern(`list:${collection}:*`)
  }

  // Invalidate global cache
  invalidateGlobal(slug: string): void {
    this.invalidatePattern(`global:${slug}*`)
  }

  // Cache wrapper for async functions
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const result = await fn()
    this.set(key, result, ttl)
    return result
  }

  // Get collection-specific TTL
  getCollectionTTL(collection: string): number {
    return COLLECTION_CACHE_TTL[collection] || CACHE_TTL.MEDIUM
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    keys: string[]
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses
      keys: Array.from(this.cache.keys()),
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Dispose cache (call when shutting down)
  dispose(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Export singleton instance
export const memoryCache = new MemoryCache()

// Cache decorator for methods
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      return memoryCache.wrap(key, () => method.apply(this, args), ttl)
    }
  }
}

// Cache middleware for API routes
export function withCache(ttl: number = CACHE_TTL.MEDIUM) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (req: any, ...args: any[]) {
      const url = req.url || req.nextUrl?.pathname
      const query = req.nextUrl?.search || ''
      const key = `api:${url}:${query}`

      return memoryCache.wrap(key, () => method.apply(this, [req, ...args]), ttl)
    }
  }
}

// Export cache TTL constants
export { CACHE_TTL, COLLECTION_CACHE_TTL }
