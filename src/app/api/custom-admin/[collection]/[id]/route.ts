import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import qs from 'qs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params
  const { searchParams } = new URL(request.url)
  const query = qs.parse(searchParams.toString(), { depth: 10 })
  const locale = query.locale as 'en' | 'th' | 'zh' | 'all' | undefined
  const depth = query.depth as number | undefined

  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // Authenticate the user
    const { user } = await getMeUser({
      cookieStore: request.cookies,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the document
    const doc = await payload.findByID({
      collection: collection as any,
      id,
      user,
      locale: locale,
      depth: depth,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const response = NextResponse.json(doc, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    return response
  } catch (error: any) {
    console.error(`Error fetching document ${id} from collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch document: ${error.message}` },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale')

  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // Authenticate the user
    const { user } = await getMeUser({
      cookieStore: request.cookies,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Update the document
    const updatedDoc = await payload.update({
      collection: collection as any,
      id,
      data: body,
      user,
      locale: isLocale(locale) ? locale : undefined,
    })

    const response = NextResponse.json(updatedDoc, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    return response
  } catch (error: any) {
    console.error(`Error updating document ${id} in collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to update document: ${error.message}` },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await params

  try {
    const payload = await getPayload({
      config: configPromise,
    })

    // Authenticate the user
    const { user } = await getMeUser({
      cookieStore: request.cookies,
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the document
    await payload.delete({
      collection: collection as any,
      id,
      user,
    })

    const response = NextResponse.json(
      { message: 'Document deleted successfully' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )
    return response
  } catch (error: any) {
    console.error(`Error deleting document ${id} in collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to delete document: ${error.message}` },
      { status: 500 },
    )
  }
}

function isLocale(value: string | null): value is 'en' | 'th' | 'zh' {
  return value === 'en' || value === 'th' || value === 'zh'
}
