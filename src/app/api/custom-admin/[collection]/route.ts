import { NextRequest, NextResponse } from 'next/server'
import { getPayload, Where } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import qs from 'qs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params
  const { searchParams } = new URL(request.url)
  const query = qs.parse(searchParams.toString(), { depth: 10 })

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

    // Find the documents
    const results = await payload.find({
      collection: collection as any,
      where: query.where as Where,
      limit: Number(query.limit) ?? 10,
      page: Number(query.page) ?? 1,
      sort: (query.sort as string) ?? '-createdAt',
      user,
      locale: query.locale as 'en' | 'th' | 'zh' | 'all' | undefined,
    })

    const response = NextResponse.json(results, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })

    return response
  } catch (error: any) {
    console.error(`Error fetching documents from collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error.message}` },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params

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

    // Create the document
    const newDoc = await payload.create({
      collection: collection as any,
      data: body,
      user,
    })

    const response = NextResponse.json(newDoc, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    return response
  } catch (error: any) {
    console.error(`Error creating document in collection ${collection}:`, error)
    return NextResponse.json(
      { error: `Failed to create document: ${error.message}` },
      { status: 500 },
    )
  }
}
