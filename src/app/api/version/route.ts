import { NextResponse } from 'next/server'

function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  )
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function GET() {
  const displayVersion = process.env.DISPLAY_VERSION || '0.0.0'
  const response = NextResponse.json({ version: displayVersion })
  return addCorsHeaders(response)
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
