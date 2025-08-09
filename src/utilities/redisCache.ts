import Redis from 'ioredis'
import type { Config } from 'src/payload-types'

// Redis configuration for ECS/ElastiCache
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  
  // ECS/Production optimizations
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  
  // Connection pooling for high traffic
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  
  // Health checks
  healthCheck: true,
  maxLoadingTimeout: 10000,
  
  // Cluster mode (if using Redis Cluster)
  enableReadyCheck: true,
  scaleReads: 'slave', // Read from replicas if available
}

// Cache configuration optimized for ECS
const CACHE_TTL = {
  SHORT: 300,      // 5 minutes - for frequently changing data
  MEDIUM: 3600,    // 1 hour - for semi-static data
  LONG: 86400,     // 24 hours - for static data
  VERY_LONG: 604800, // 7 days - for rarely changing data
}

// Collection-specific TTLs for ECS
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

// Cache key generators with ECS optimizations
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

  // ECS-specific keys
  instance: (instanceId: string) => `instance:${instanceId}`,
  health: () => 'health:check',
}

// Redis cache manager for ECS
export class RedisCacheManager {
  private redis: Redis
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  constructor() {
    this.redis = new Redis(redisConfig)
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      console.log('✅ Redis connected')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.redis.on('error', (error) => {
      console.error('❌ Redis error:', error)
      this.isConnected = false
    })

    this.redis.on('close', () => {
      console.log('🔌 Redis connection closed')
      this.isConnected = false
    })

    this.redis.on('reconnecting', () => {
      this.reconnectAttempts++
      console.log(`🔄 Redis reconnecting... (attempt ${this.reconnectAttempts})`)
    })
  }

  // Get cached data with fallback
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        console.warn('⚠️ Redis not connected, skipping cache get')
        return null
      }

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
      if (!this.isConnected) {
        console.warn('⚠️ Redis not connected, skipping cache set')
        return
      }

      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete specific cache key
  async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) return
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Invalidate all cache keys matching pattern
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) return
      
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        console.log(`🗑️ Invalidated ${keys.length} cache keys matching: ${pattern}`)
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

  // Cache wrapper for async functions with fallback
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    fallbackToMemory: boolean = true
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      const result = await fn()
      await this.set(key, result, ttl)
      return result
    } catch (error) {
      console.error('Cache wrap error:', error)
      
      // Fallback to memory cache if Redis fails
      if (fallbackToMemory) {
        console.log('🔄 Falling back to memory cache')
        const { memoryCache } = await import('./memoryCache')
        return memoryCache.wrap(key, fn, ttl)
      }
      
      // If no fallback, just execute the function
      return await fn()
    }
  }

  // Get collection-specific TTL
  getCollectionTTL(collection: string): number {
    return COLLECTION_CACHE_TTL[collection] || CACHE_TTL.MEDIUM
  }

  // Health check for ECS
  async healthCheck(): Promise<{
    healthy: boolean
    connected: boolean
    latency: number
    memory: any
  }> {
    try {
      const start = Date.now()
      await this.redis.ping()
      const latency = Date.now() - start

      const info = await this.redis.info('memory')
      const keys = await this.redis.dbsize()

      return {
        healthy: this.isConnected && latency < 100,
        connected: this.isConnected,
        latency,
        memory: { info, keys },
      }
    } catch (error) {
      console.error('Redis health check failed:', error)
      return {
        healthy: false,
        connected: false,
        latency: -1,
        memory: null,
      }
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    keys: number
    memory: string
    connected: boolean
    instanceId: string
  }> {
    try {
      const info = await this.redis.info('memory')
      const keys = await this.redis.dbsize()
      const instanceId = process.env.ECS_CONTAINER_METADATA_URI_V4 || 'unknown'

      return {
        keys,
        memory: info,
        connected: this.isConnected,
        instanceId,
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        keys: 0,
        memory: 'unknown',
        connected: false,
        instanceId: 'unknown',
      }
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      console.log('🔌 Redis disconnected gracefully')
    } catch (error) {
      console.error('Redis disconnect error:', error)
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCacheManager()

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down Redis cache...')
  await redisCache.disconnect()
})

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down Redis cache...')
  await redisCache.disconnect()
})

// Export cache TTL constants
export { CACHE_TTL, COLLECTION_CACHE_TTL } 