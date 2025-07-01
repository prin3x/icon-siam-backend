import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey } from '@/middleware/apiKeyAuth'
import { getPayload } from 'payload'
import config from '@payload-config'

// Add CORS headers for media files
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:3000',
  )
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// Initialize Payload
let payload: any = null

async function getPayloadInstance() {
  if (!payload) {
    payload = await getPayload({ config })
  }
  return payload
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    // Validate API key
    const apiKeyUser = await validateApiKey(request)

    if (!apiKeyUser) {
      const errorResponse = NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      )
      return addCorsHeaders(errorResponse)
    }

    // Check if user has access to media collection
    if (!apiKeyUser.collections.includes('*') && !apiKeyUser.collections.includes('media')) {
      const errorResponse = NextResponse.json(
        { error: 'Access denied to media collection' },
        { status: 403 },
      )
      return addCorsHeaders(errorResponse)
    }

    const payloadInstance = await getPayloadInstance()
    const { slug } = await params

    // Get the media file
    const mediaId = slug[0]

    try {
      const media = await payloadInstance.findByID({
        collection: 'media',
        id: mediaId,
      })

      if (!media) {
        const errorResponse = NextResponse.json({ error: 'Media not found' }, { status: 404 })
        return addCorsHeaders(errorResponse)
      }

      // Return the media data
      const response = NextResponse.json(media)
      return addCorsHeaders(response)
    } catch (error) {
      console.error('Error fetching media:', error)
      const errorResponse = NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
      return addCorsHeaders(errorResponse)
    }
  } catch (error) {
    console.error('Media authentication error:', error)
    const errorResponse = NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    return addCorsHeaders(errorResponse)
  }
}

export async function OPTIONS() {
  // Handle preflight requests for media
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}
