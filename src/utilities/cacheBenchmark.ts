import { memoryCache } from './memoryCache'
import { getCachedDocument, getDocument } from './getDocument'
import { performance } from 'perf_hooks'

// Benchmark utility to test cache performance
export class CacheBenchmark {
  private results: Array<{
    test: string
    duration: number
    cacheHit: boolean
  }> = []

  // Test direct database query vs cached query
  async benchmarkDatabaseVsCache(collection: string, slug: string, iterations: number = 100) {
    console.log(`\n🏃‍♂️ Benchmarking: ${collection}:${slug}`)
    console.log(`Iterations: ${iterations}`)
    console.log('─'.repeat(50))

    // Clear cache before test
    memoryCache.clear()

    // Test 1: Direct database query (no cache)
    const dbStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await getDocument(collection, slug)
    }
    const dbDuration = performance.now() - dbStart

    // Test 2: Cached query (first hit will miss, rest will hit)
    const cacheStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await getCachedDocument(collection, slug)
    }
    const cacheDuration = performance.now() - cacheStart

    // Test 3: Pure cache hits (data already cached)
    const pureCacheStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      await getCachedDocument(collection, slug)
    }
    const pureCacheDuration = performance.now() - pureCacheStart

    // Results
    console.log(`📊 Results:`)
    console.log(
      `Database queries: ${dbDuration.toFixed(2)}ms (${(dbDuration / iterations).toFixed(2)}ms per query)`,
    )
    console.log(
      `Cached queries:   ${cacheDuration.toFixed(2)}ms (${(cacheDuration / iterations).toFixed(2)}ms per query)`,
    )
    console.log(
      `Pure cache hits:  ${pureCacheDuration.toFixed(2)}ms (${(pureCacheDuration / iterations).toFixed(2)}ms per query)`,
    )

    const dbAvg = dbDuration / iterations
    const cacheAvg = cacheDuration / iterations
    const pureCacheAvg = pureCacheDuration / iterations

    console.log(`\n🚀 Performance Improvement:`)
    console.log(`Cache vs Database: ${(((dbAvg - cacheAvg) / dbAvg) * 100).toFixed(1)}% faster`)
    console.log(
      `Pure Cache vs Database: ${(((dbAvg - pureCacheAvg) / dbAvg) * 100).toFixed(1)}% faster`,
    )

    return {
      database: { total: dbDuration, average: dbAvg },
      cached: { total: cacheDuration, average: cacheAvg },
      pureCache: { total: pureCacheDuration, average: pureCacheAvg },
      improvement: {
        cached: ((dbAvg - cacheAvg) / dbAvg) * 100,
        pureCache: ((dbAvg - pureCacheAvg) / dbAvg) * 100,
      },
    }
  }

  // Test cache memory usage
  async benchmarkMemoryUsage() {
    console.log('\n🧠 Memory Usage Benchmark')
    console.log('─'.repeat(50))

    const initialStats = memoryCache.getStats()
    console.log(`Initial cache size: ${initialStats.size} entries`)

    // Add 1000 test entries
    const testData = { message: 'test', timestamp: Date.now() }
    const start = performance.now()

    for (let i = 0; i < 1000; i++) {
      memoryCache.set(`test:${i}`, testData, 3600)
    }

    const duration = performance.now() - start
    const finalStats = memoryCache.getStats()

    console.log(`Added 1000 entries in: ${duration.toFixed(2)}ms`)
    console.log(`Final cache size: ${finalStats.size} entries`)
    console.log(`Cache utilization: ${((finalStats.size / finalStats.maxSize) * 100).toFixed(1)}%`)

    // Cleanup
    memoryCache.clear()

    return {
      duration,
      entriesAdded: 1000,
      finalSize: finalStats.size,
      utilization: (finalStats.size / finalStats.maxSize) * 100,
    }
  }

  // Test cache invalidation performance
  async benchmarkInvalidation() {
    console.log('\n🗑️ Cache Invalidation Benchmark')
    console.log('─'.repeat(50))

    // Add test data
    for (let i = 0; i < 100; i++) {
      memoryCache.set(`events:${i}`, { id: i, title: `Event ${i}` }, 3600)
      memoryCache.set(`shops:${i}`, { id: i, name: `Shop ${i}` }, 3600)
      memoryCache.set(`promotions:${i}`, { id: i, title: `Promo ${i}` }, 3600)
    }

    const initialSize = memoryCache.getStats().size
    console.log(`Initial cache size: ${initialSize} entries`)

    // Test individual invalidation
    const individualStart = performance.now()
    for (let i = 0; i < 50; i++) {
      memoryCache.invalidateDocument('events', i.toString())
    }
    const individualDuration = performance.now() - individualStart

    // Test collection invalidation
    const collectionStart = performance.now()
    memoryCache.invalidateCollection('shops')
    const collectionDuration = performance.now() - collectionStart

    // Test pattern invalidation
    const patternStart = performance.now()
    memoryCache.invalidatePattern('*promotions*')
    const patternDuration = performance.now() - patternStart

    const finalSize = memoryCache.getStats().size

    console.log(`Individual invalidation (50): ${individualDuration.toFixed(2)}ms`)
    console.log(`Collection invalidation: ${collectionDuration.toFixed(2)}ms`)
    console.log(`Pattern invalidation: ${patternDuration.toFixed(2)}ms`)
    console.log(`Final cache size: ${finalSize} entries`)

    // Cleanup
    memoryCache.clear()

    return {
      individual: individualDuration,
      collection: collectionDuration,
      pattern: patternDuration,
      entriesRemoved: initialSize - finalSize,
    }
  }

  // Run all benchmarks
  async runAllBenchmarks() {
    console.log('🎯 Cache Performance Benchmarks')
    console.log('='.repeat(60))

    try {
      // Memory usage test
      await this.benchmarkMemoryUsage()

      // Invalidation test
      await this.benchmarkInvalidation()

      // Database vs Cache test (if collection exists)
      try {
        await this.benchmarkDatabaseVsCache('events', 'test-event', 10)
      } catch (error) {
        console.log('\n⚠️ Database benchmark skipped (test collection not found)')
      }

      console.log('\n✅ All benchmarks completed!')
    } catch (error) {
      console.error('❌ Benchmark error:', error)
    }
  }
}

// Export singleton
export const cacheBenchmark = new CacheBenchmark()

// Quick test function
export async function quickCacheTest() {
  console.log('⚡ Quick Cache Test')

  const testData = { message: 'Hello Cache!', timestamp: Date.now() }

  // Test set/get
  const setStart = performance.now()
  memoryCache.set('test:quick', testData, 60)
  const setDuration = performance.now() - setStart

  const getStart = performance.now()
  const cached = memoryCache.get('test:quick')
  const getDuration = performance.now() - getStart

  console.log(`Set: ${setDuration.toFixed(3)}ms`)
  console.log(`Get: ${getDuration.toFixed(3)}ms`)
  console.log(`Data:`, cached)

  // Cleanup
  memoryCache.delete('test:quick')
}
