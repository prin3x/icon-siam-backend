import config from '@payload-config'
import { REST_GET } from '@payloadcms/next/routes'
import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticatedRequest } from '@/utilities/authHandler'
import { addCorsHeaders } from '@/utilities/corsUtils'

// Only allow GET requests for read-only access
export const GET = async (request: NextRequest, args: { params: Promise<{ slug: string[] }> }) => {
  return handleAuthenticatedRequest(request, args, REST_GET(config), {
    allowedMethods: 'GET, OPTIONS',
  })
}

export const OPTIONS = async (request: Request, args: { params: Promise<{ slug: string[] }> }) => {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response, { allowedMethods: 'GET, OPTIONS' })
}
