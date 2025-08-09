import type { CollectionConfig, GlobalConfig } from 'payload/types'
import { memoryCache } from './memoryCache'

// Cache invalidation hooks for collections
export const createCacheHooks = (collectionSlug: string) => ({
  afterChange: [
    async ({ doc, previousDoc }) => {
      // Invalidate document cache
      memoryCache.invalidateDocument(collectionSlug, doc.id)

      // Invalidate collection list cache
      memoryCache.invalidateCollection(collectionSlug)

      console.log(`Cache invalidated for ${collectionSlug}:${doc.id}`)
    },
  ],

  afterDelete: [
    async ({ id }) => {
      // Invalidate document cache
      memoryCache.invalidateDocument(collectionSlug, id)

      // Invalidate collection list cache
      memoryCache.invalidateCollection(collectionSlug)

      console.log(`Cache invalidated for deleted ${collectionSlug}:${id}`)
    },
  ],

  afterRead: [
    async ({ doc }) => {
      // Optional: Pre-warm cache for frequently accessed documents
      if (doc.slug) {
        const cacheKey = `doc:${collectionSlug}:slug:${doc.slug}`
        const ttl = memoryCache.getCollectionTTL(collectionSlug)
        memoryCache.set(cacheKey, doc, ttl)
      }
    },
  ],
})

// Cache invalidation hooks for globals
export const createGlobalCacheHooks = (globalSlug: string) => ({
  afterChange: [
    async ({ doc }) => {
      // Invalidate global cache
      memoryCache.invalidateGlobal(globalSlug)

      console.log(`Global cache invalidated for ${globalSlug}`)
    },
  ],
})

// Bulk cache invalidation utility
export const invalidateAllCache = () => {
  memoryCache.clear()
  console.log('All cache cleared')
}

// Cache statistics utility
export const getCacheStats = () => {
  return memoryCache.getStats()
}

// Cache health check
export const checkCacheHealth = () => {
  const stats = memoryCache.getStats()
  return {
    healthy: stats.size < stats.maxSize * 0.9, // 90% capacity threshold
    stats,
  }
}
