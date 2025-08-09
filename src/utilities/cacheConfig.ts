import { memoryCache } from './memoryCache'
import { redisCache } from './redisCache'

// Environment detection
export const isECS = process.env.ECS_CONTAINER_METADATA_URI_V4 !== undefined
export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'

// Cache strategy selection
export enum CacheStrategy {
  MEMORY = 'memory',
  REDIS = 'redis',
  HYBRID = 'hybrid',
}

// Cache configuration based on environment
export class CacheConfig {
  private strategy: CacheStrategy
  private useRedis: boolean
  private useMemory: boolean

  constructor() {
    this.strategy = this.determineStrategy()
    this.useRedis = this.strategy === CacheStrategy.REDIS || this.strategy === CacheStrategy.HYBRID
    this.useMemory = this.strategy === CacheStrategy.MEMORY || this.strategy === CacheStrategy.HYBRID
  }

  private determineStrategy(): CacheStrategy {
    // ECS Production: Use Redis
    if (isECS && isProduction) {
      return CacheStrategy.REDIS
    }

    // ECS Non-Production: Use Hybrid (Redis + Memory fallback)
    if (isECS && !isProduction) {
      return CacheStrategy.HYBRID
    }

    // Local Development: Use Memory
    if (isDevelopment) {
      return CacheStrategy.MEMORY
    }

    // Default: Use Memory
    return CacheStrategy.MEMORY
  }

  // Get the primary cache instance
  get primaryCache() {
    if (this.useRedis) {
      return redisCache
    }
    return memoryCache
  }

  // Get the fallback cache instance
  get fallbackCache() {
    if (this.strategy === CacheStrategy.HYBRID) {
      return memoryCache
    }
    return null
  }

  // Get cache strategy info
  get info() {
    return {
      strategy: this.strategy,
      environment: {
        isECS,
        isProduction,
        isDevelopment,
      },
      redis: {
        enabled: this.useRedis,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
      memory: {
        enabled: this.useMemory,
      },
    }
  }

  // Unified cache interface
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try primary cache first
      const result = await this.primaryCache.get<T>(key)
      if (result !== null) {
        return result
      }

      // Try fallback cache if available
      if (this.fallbackCache) {
        return await this.fallbackCache.get<T>(key)
      }

      return null
    } catch (error) {
      console.error('Cache get error:', error)
      
      // Try fallback cache on error
      if (this.fallbackCache) {
        try {
          return await this.fallbackCache.get<T>(key)
        } catch (fallbackError) {
          console.error('Fallback cache error:', fallbackError)
        }
      }
      
      return null
    }
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    try {
      // Set in primary cache
      await this.primaryCache.set(key, data, ttl)
      
      // Set in fallback cache if available
      if (this.fallbackCache) {
        await this.fallbackCache.set(key, data, ttl)
      }
    } catch (error) {
      console.error('Cache set error:', error)
      
      // Try fallback cache on error
      if (this.fallbackCache) {
        try {
          await this.fallbackCache.set(key, data, ttl)
        } catch (fallbackError) {
          console.error('Fallback cache set error:', fallbackError)
        }
      }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.primaryCache.delete(key)
      if (this.fallbackCache) {
        await this.fallbackCache.delete(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.primaryCache.invalidatePattern(pattern)
      if (this.fallbackCache) {
        await this.fallbackCache.invalidatePattern(pattern)
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }

  async invalidateCollection(collection: string): Promise<void> {
    try {
      await this.primaryCache.invalidateCollection(collection)
      if (this.fallbackCache) {
        await this.fallbackCache.invalidateCollection(collection)
      }
    } catch (error) {
      console.error('Cache invalidate collection error:', error)
    }
  }

  async invalidateDocument(collection: string, id: string): Promise<void> {
    try {
      await this.primaryCache.invalidateDocument(collection, id)
      if (this.fallbackCache) {
        await this.fallbackCache.invalidateDocument(collection, id)
      }
    } catch (error) {
      console.error('Cache invalidate document error:', error)
    }
  }

  async invalidateGlobal(slug: string): Promise<void> {
    try {
      await this.primaryCache.invalidateGlobal(slug)
      if (this.fallbackCache) {
        await this.fallbackCache.invalidateGlobal(slug)
      }
    } catch (error) {
      console.error('Cache invalidate global error:', error)
    }
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try primary cache first
      const cached = await this.primaryCache.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // Execute function and cache result
      const result = await fn()
      await this.set(key, result, ttl)
      return result
    } catch (error) {
      console.error('Cache wrap error:', error)
      
      // Try fallback cache
      if (this.fallbackCache) {
        try {
          return await this.fallbackCache.wrap(key, fn, ttl)
        } catch (fallbackError) {
          console.error('Fallback cache wrap error:', fallbackError)
        }
      }
      
      // If all else fails, just execute the function
      return await fn()
    }
  }

  getCollectionTTL(collection: string): number {
    return this.primaryCache.getCollectionTTL(collection)
  }

  async healthCheck(): Promise<any> {
    const primaryHealth = await this.primaryCache.healthCheck()
    
    if (this.fallbackCache) {
      const fallbackHealth = await this.fallbackCache.healthCheck()
      return {
        primary: primaryHealth,
        fallback: fallbackHealth,
        strategy: this.strategy,
      }
    }
    
    return {
      primary: primaryHealth,
      strategy: this.strategy,
    }
  }

  async getStats(): Promise<any> {
    const primaryStats = await this.primaryCache.getStats()
    
    if (this.fallbackCache) {
      const fallbackStats = this.fallbackCache.getStats()
      return {
        primary: primaryStats,
        fallback: fallbackStats,
        strategy: this.strategy,
      }
    }
    
    return {
      primary: primaryStats,
      strategy: this.strategy,
    }
  }
}

// Export singleton instance
export const cacheConfig = new CacheConfig()

// Export the unified cache interface
export const cache = {
  get: (key: string) => cacheConfig.get(key),
  set: (key: string, data: any, ttl?: number) => cacheConfig.set(key, data, ttl),
  delete: (key: string) => cacheConfig.delete(key),
  invalidatePattern: (pattern: string) => cacheConfig.invalidatePattern(pattern),
  invalidateCollection: (collection: string) => cacheConfig.invalidateCollection(collection),
  invalidateDocument: (collection: string, id: string) => cacheConfig.invalidateDocument(collection, id),
  invalidateGlobal: (slug: string) => cacheConfig.invalidateGlobal(slug),
  wrap: (key: string, fn: () => Promise<any>, ttl?: number) => cacheConfig.wrap(key, fn, ttl),
  getCollectionTTL: (collection: string) => cacheConfig.getCollectionTTL(collection),
  healthCheck: () => cacheConfig.healthCheck(),
  getStats: () => cacheConfig.getStats(),
  info: cacheConfig.info,
} 