import { NextResponse } from 'next/server'

export interface CorsOptions {
  allowedMethods?: string
  allowedHeaders?: string
}

export function addCorsHeaders(response: NextResponse, options: CorsOptions = {}): NextResponse {
  const {
    allowedMethods = 'GET, OPTIONS',
    allowedHeaders = 'Content-Type, Authorization, X-API-Key',
  } = options

  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  )
  response.headers.set('Access-Control-Allow-Methods', allowedMethods)
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders)
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Security headers
  response.headers.set('Content-Security-Policy', "default-src 'self'")
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}
