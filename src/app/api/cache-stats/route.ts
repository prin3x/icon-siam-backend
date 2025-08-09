import { NextResponse } from 'next/server'
import { cache } from '@/utilities/cacheConfig'

export async function GET() {
  try {
    const stats = await cache.getStats()
    const health = await cache.healthCheck()
    const info = cache.info
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        health,
        info,
        timestamp: new Date().toISOString(),
        environment: {
          isECS: process.env.ECS_CONTAINER_METADATA_URI_V4 !== undefined,
          isProduction: process.env.NODE_ENV === 'production',
          nodeEnv: process.env.NODE_ENV,
        },
      },
    })
  } catch (error) {
    console.error('Cache stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get cache stats' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    // Clear all caches
    if (cache.info.strategy === 'hybrid' || cache.info.strategy === 'memory') {
      const { memoryCache } = await import('@/utilities/memoryCache')
      memoryCache.clear()
    }
    
    if (cache.info.strategy === 'hybrid' || cache.info.strategy === 'redis') {
      const { redisCache } = await import('@/utilities/redisCache')
      // Note: Redis clear is more complex, we'll invalidate by patterns instead
      await redisCache.invalidatePattern('*')
    }
    
    return NextResponse.json({
      success: true,
      message: 'All cache cleared successfully',
      strategy: cache.info.strategy,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json({ success: false, error: 'Failed to clear cache' }, { status: 500 })
  }
}

// Cache health check endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'health':
        const health = await cache.healthCheck()
        return NextResponse.json({
          success: true,
          data: health,
        })

      case 'stats':
        const stats = await cache.getStats()
        return NextResponse.json({
          success: true,
          data: stats,
        })

      case 'info':
        return NextResponse.json({
          success: true,
          data: cache.info,
        })

      case 'test':
        // Test cache functionality
        const testKey = 'health:test'
        const testData = { message: 'Cache test', timestamp: Date.now() }
        
        await cache.set(testKey, testData, 60)
        const retrieved = await cache.get(testKey)
        await cache.delete(testKey)
        
        return NextResponse.json({
          success: true,
          data: {
            test: 'passed',
            set: true,
            get: retrieved !== null,
            delete: true,
            strategy: cache.info.strategy,
          },
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cache action error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to execute cache action' },
      { status: 500 }
    )
  }
}
