import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { memoryCache, generateCacheKey, CACHE_TTL } from './memoryCache'

type Collection = keyof Config['collections']

export const getDocument = async (collection: Collection, slug: string, depth = 0) => {
  const payload = await getPayload({
    config: configPromise,
  })

  const { docs } = await payload.find({
    collection: collection as any,
    where: {
      slug: {
        equals: slug,
      },
    },
    depth,
  })

  return docs[0] || null
}

/**
 * Returns a cached document with Redis and Next.js caching
 */
export const getCachedDocument = (collection: Collection, slug: string, depth = 0) =>
  unstable_cache(
    async () => {
      // Try memory cache first
      const cacheKey = generateCacheKey.documentBySlug(collection, slug)
      const cached = memoryCache.get(cacheKey)

      if (cached) {
        return cached
      }

      // If not in cache, fetch from database
      const document = await getDocument(collection, slug, depth)

      if (document) {
        // Cache in memory with collection-specific TTL
        const ttl = memoryCache.getCollectionTTL(collection)
        memoryCache.set(cacheKey, document, ttl)
      }

      return document
    },
    [collection, slug, depth],
    {
      tags: [`${collection}_${slug}`],
      revalidate: CACHE_TTL.SHORT, // Revalidate every 5 minutes
    },
  )

/**
 * Get document by ID with caching
 */
export const getDocumentById = async (collection: Collection, id: string, depth = 0) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return await payload.findByID({
    collection: collection as any,
    id,
    depth,
  })
}

/**
 * Returns a cached document by ID with Redis and Next.js caching
 */
export const getCachedDocumentById = (collection: Collection, id: string, depth = 0) =>
  unstable_cache(
    async () => {
      // Try memory cache first
      const cacheKey = generateCacheKey.document(collection, id)
      const cached = memoryCache.get(cacheKey)

      if (cached) {
        return cached
      }

      // If not in cache, fetch from database
      const document = await getDocumentById(collection, id, depth)

      if (document) {
        // Cache in memory with collection-specific TTL
        const ttl = memoryCache.getCollectionTTL(collection)
        memoryCache.set(cacheKey, document, ttl)
      }

      return document
    },
    [collection, id, depth],
    {
      tags: [`${collection}_${id}`],
      revalidate: CACHE_TTL.SHORT,
    },
  )

/**
 * Get multiple documents with caching
 */
export const getDocuments = async (
  collection: Collection,
  params: {
    where?: any
    limit?: number
    page?: number
    sort?: string
    depth?: number
    locale?: 'en' | 'th' | 'zh' | 'all'
  } = {},
) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return await payload.find({
    collection: collection as any,
    ...params,
  })
}

/**
 * Returns cached documents with Redis and Next.js caching
 */
export const getCachedDocuments = (collection: Collection, params: any = {}) =>
  unstable_cache(
    async () => {
      // Try memory cache first
      const cacheKey = generateCacheKey.collectionList(collection, params)
      const cached = memoryCache.get(cacheKey)

      if (cached) {
        return cached
      }

      // If not in cache, fetch from database
      const documents = await getDocuments(collection, params)

      if (documents) {
        // Cache in memory with collection-specific TTL
        const ttl = memoryCache.getCollectionTTL(collection)
        memoryCache.set(cacheKey, documents, ttl)
      }

      return documents
    },
    [collection, JSON.stringify(params)],
    {
      tags: [`${collection}_list`],
      revalidate: CACHE_TTL.SHORT,
    },
  )
