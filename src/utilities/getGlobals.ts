import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { memoryCache, generateCacheKey, CACHE_TTL } from './memoryCache'

type Global = keyof Config['globals']

export const getGlobal = async (slug: Global, depth = 0) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return await payload.findGlobal({
    slug: slug as any,
    depth,
  })
}

/**
 * Returns a cached global with Redis and Next.js caching
 */
export const getCachedGlobal = (slug: Global, depth = 0) =>
  unstable_cache(
    async () => {
      // Try memory cache first
      const cacheKey = generateCacheKey.global(slug)
      const cached = memoryCache.get(cacheKey)

      if (cached) {
        return cached
      }

      // If not in cache, fetch from database
      const global = await getGlobal(slug, depth)

      if (global) {
        // Cache in memory with long TTL for globals
        memoryCache.set(cacheKey, global, CACHE_TTL.LONG)
      }

      return global
    },
    [slug, depth],
    {
      tags: [`global_${slug}`],
      revalidate: CACHE_TTL.MEDIUM, // Revalidate every hour
    },
  )

/**
 * Get global by locale with caching
 */
export const getGlobalByLocale = async (
  slug: Global,
  locale: 'en' | 'th' | 'zh' | 'all',
  depth = 0,
) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return await payload.findGlobal({
    slug: slug as any,
    depth,
    locale,
  })
}

/**
 * Returns a cached global by locale with Redis and Next.js caching
 */
export const getCachedGlobalByLocale = (
  slug: Global,
  locale: 'en' | 'th' | 'zh' | 'all',
  depth = 0,
) =>
  unstable_cache(
    async () => {
      // Try memory cache first
      const cacheKey = generateCacheKey.global(slug, locale)
      const cached = memoryCache.get(cacheKey)

      if (cached) {
        return cached
      }

      // If not in cache, fetch from database
      const global = await getGlobalByLocale(slug, locale, depth)

      if (global) {
        // Cache in memory with long TTL for globals
        memoryCache.set(cacheKey, global, CACHE_TTL.LONG)
      }

      return global
    },
    [slug, locale, depth],
    {
      tags: [`global_${slug}_${locale}`],
      revalidate: CACHE_TTL.MEDIUM,
    },
  )
