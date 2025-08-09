import Redis from 'ioredis'
import type { Config } from 'src/payload-types'

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
})

// Cache configuration
const CACHE_TTL = {
  // Short-lived cache for frequently changing data
  SHORT: 300, // 5 minutes
  // Medium cache for semi-static data
  MEDIUM: 3600, // 1 hour
  // Long cache for static data
  LONG: 86400, // 24 hours
  // Very long cache for rarely changing data
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
  // Document by ID
  document: (collection: string, id: string, locale?: string) =>
    `doc:${collection}:${id}${locale ? `:${locale}` : ''}`,

  // Document by slug
  documentBySlug: (collection: string, slug: string, locale?: string) =>
    `doc:${collection}:slug:${slug}${locale ? `:${locale}` : ''}`,

  // Collection list
  collectionList: (collection: string, params: Record<string, any>) =>
    `list:${collection}:${JSON.stringify(params)}`,

  // Global
  global: (slug: string, locale?: string) => `global:${slug}${locale ? `:${locale}` : ''}`,

  // Media
  media: (id: string) => `media:${id}`,

  // API response
  apiResponse: (endpoint: string, params: Record<string, any>) =>
    `api:${endpoint}:${JSON.stringify(params)}`,
}

// Cache utility functions
export class CacheManager {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cached data with TTL
  async set(key: string, data: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete specific cache key
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Invalidate all cache keys matching pattern
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }

  // Invalidate collection cache
  async invalidateCollection(collection: string): Promise<void> {
    await this.invalidatePattern(`*:${collection}:*`)
    await this.invalidatePattern(`list:${collection}:*`)
  }

  // Invalidate document cache
  async invalidateDocument(collection: string, id: string): Promise<void> {
    await this.invalidatePattern(`doc:${collection}:${id}*`)
    await this.invalidatePattern(`list:${collection}:*`)
  }

  // Invalidate global cache
  async invalidateGlobal(slug: string): Promise<void> {
    await this.invalidatePattern(`global:${slug}*`)
  }

  // Cache wrapper for async functions
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const result = await fn()
    await this.set(key, result, ttl)
    return result
  }

  // Get collection-specific TTL
  getCollectionTTL(collection: string): number {
    return COLLECTION_CACHE_TTL[collection] || CACHE_TTL.MEDIUM
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping()
      return true
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    keys: number
    memory: string
    connected: boolean
  }> {
    try {
      const info = await this.redis.info('memory')
      const keys = await this.redis.dbsize()

      return {
        keys,
        memory: info,
        connected: this.redis.status === 'ready',
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        keys: 0,
        memory: 'unknown',
        connected: false,
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Cache decorator for methods
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      return cacheManager.wrap(key, () => method.apply(this, args), ttl)
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

      return cacheManager.wrap(key, () => method.apply(this, [req, ...args]), ttl)
    }
  }
}

// Export cache TTL constants
export { CACHE_TTL, COLLECTION_CACHE_TTL }
