import path from 'path'
import fs from 'fs/promises'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Map collection slugs to specific preview image filenames
const slugToFile: Record<string, string> = {
  homepage: 'Homepage.png',
  'page-banners': 'page-banner.png',
  events: 'Events-activities.png',
  shops: 'shopping.png',
  dinings: 'dining.png',
  attractions: 'Attraction.png',
  'icon-craft': 'ICONCRAFT.png',
  'icon-luxe': 'ICONLUXE.png',
  'getting-here': 'Getting here.png',
  directory: 'Directory.png',
  floors: 'Directory.png',
  footers: 'Footer.png',
  stickbar: 'Stickbar.png',
  facilities: 'facilities.png',
  'about-iconsiam': 'about-iconsiam.png',
  'board-of-directors': 'board-of-directors.png',
  'iconsiam-awards': 'iconsiam-awards.png',
  'vision-mission': 'vision-mission.png',
  residences: 'residences.png',
  stories: 'the-stories.png',
  'news-press': 'news-press.png',
}

// Root path for static preview assets added to the repository
const PREVIEW_DIR = path.resolve(process.cwd(), 'assets', 'cms-preview')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params

  const filename = slugToFile[collection]
  if (!filename) {
    return NextResponse.json(
      { error: `No example available for collection: ${collection}` },
      { status: 404 },
    )
  }

  const absPath = path.join(PREVIEW_DIR, filename)
  try {
    const file = await fs.readFile(absPath)
    // Infer content type from extension (all are png in provided folder)
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ error: `Preview not found for ${collection}` }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to load preview image' }, { status: 500 })
  }
}
