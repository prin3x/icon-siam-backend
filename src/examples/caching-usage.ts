// Example usage of enhanced caching system

import { getCachedDocument, getCachedDocuments, getCachedGlobal } from '@/utilities/getDocument'
import { getCachedGlobalByLocale } from '@/utilities/getGlobals'
import { memoryCache, generateCacheKey, CACHE_TTL } from '@/utilities/memoryCache'
import { createCacheHooks } from '@/utilities/cacheHooks'

// Example 1: Get cached document by slug
export async function getEventBySlug(slug: string) {
  return await getCachedDocument('events', slug, 2) // depth = 2
}

// Example 2: Get cached document by ID
export async function getShopById(id: string) {
  return await getCachedDocumentById('shops', id, 1)
}

// Example 3: Get cached collection list
export async function getActivePromotions() {
  return await getCachedDocuments('promotions', {
    where: {
      status: { equals: 'published' },
      startDate: { less_than_equal: new Date().toISOString() },
      endDate: { greater_than_equal: new Date().toISOString() },
    },
    sort: '-createdAt',
    limit: 10,
  })
}

// Example 4: Get cached global
export async function getHomepageData() {
  return await getCachedGlobal('homepage', 2)
}

// Example 5: Get cached global by locale
export async function getFooterByLocale(locale: 'en' | 'th' | 'zh') {
  return await getCachedGlobalByLocale('footers', locale, 1)
}

// Example 6: Manual cache operations
export async function cacheCustomData() {
  const customData = { message: 'Hello World', timestamp: Date.now() }

  // Set custom cache with TTL
  memoryCache.set('custom:greeting', customData, CACHE_TTL.SHORT)

  // Get cached data
  const cached = memoryCache.get('custom:greeting')

  return cached
}

// Example 7: Cache wrapper for expensive operations
export async function getExpensiveCalculation(input: number) {
  const cacheKey = `calc:${input}`

  return await memoryCache.wrap(
    cacheKey,
    async () => {
      // Simulate expensive calculation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { result: input * 2, computed: Date.now() }
    },
    CACHE_TTL.MEDIUM,
  )
}

// Example 8: Using cache decorator (if using classes)
class DataService {
  @cached(CACHE_TTL.SHORT)
  async getPopularShops() {
    // This method result will be cached automatically
    return await getCachedDocuments('shops', {
      where: { isPopular: { equals: true } },
      sort: '-visits',
      limit: 5,
    })
  }
}

// Example 9: Collection with cache hooks
export const EventsWithCache: CollectionConfig = {
  slug: 'events',
  // ... other collection config
  hooks: {
    ...createCacheHooks('events'),
  },
}

// Example 10: Cache invalidation patterns
export async function invalidateEventCache(eventId: string) {
  // Invalidate specific event
  memoryCache.invalidateDocument('events', eventId)

  // Invalidate all event lists
  memoryCache.invalidateCollection('events')

  // Invalidate related caches
  memoryCache.invalidatePattern('*homepage*') // If events appear on homepage
  memoryCache.invalidatePattern('*promotions*') // If events are related to promotions
}

// Example 11: Cache monitoring
export async function monitorCache() {
  const stats = memoryCache.getStats()
  const health = checkCacheHealth()

  console.log('Cache Stats:', {
    size: stats.size,
    maxSize: stats.maxSize,
    utilization: `${((stats.size / stats.maxSize) * 100).toFixed(2)}%`,
    healthy: health.healthy,
  })

  return { stats, health }
}

// Example 12: Conditional caching based on environment
export async function getConditionalCachedData(key: string, fetchFn: () => Promise<any>) {
  // Only use cache in production
  if (process.env.NODE_ENV === 'production') {
    return await memoryCache.wrap(key, fetchFn, CACHE_TTL.MEDIUM)
  }

  // Skip cache in development
  return await fetchFn()
}

// Example 13: Cache with custom key generation
export async function getCachedDataWithCustomKey(params: any) {
  const cacheKey = generateCacheKey.apiResponse('/api/custom', params)

  return await memoryCache.wrap(
    cacheKey,
    async () => {
      // Your data fetching logic here
      return { data: 'custom data', params }
    },
    CACHE_TTL.SHORT,
  )
}
