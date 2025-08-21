import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs/promises'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pg types can be missing at build-time, resolved at runtime
import { Pool } from 'pg'

type StoryRow = {
  id?: number
  slug?: string
  url_slug_en?: string
  url_slug_th?: string
  url_slug_cn?: string
  title_en?: string
  title_th?: string
  title_cn?: string
  sub_title_en?: string
  sub_title_th?: string
  sub_title_cn?: string
  seo_keyword_en?: string
  seo_keyword_th?: string
  seo_keyword_cn?: string
  seo_desc_en?: string
  seo_desc_th?: string
  seo_desc_cn?: string
  text_en?: string
  text_th?: string
  text_cn?: string
  image_thumbnail?: string
  cover_photo?: string
  facebook_image_url?: string
  image_thumbnail_en?: string
  cover_photo_en?: string
  facebook_image_url_en?: string
  image_thumbnail_cn?: string
  cover_photo_cn?: string
  facebook_image_url_cn?: string
  start_date?: string
  end_date?: string
  startDate?: string
  endDate?: string
  date_start?: string
  date_end?: string
  cid?: number | string
  scid?: number | string
  create_by?: string
  modified_at?: string
}

function decodeText(text: string | null | undefined): string {
  if (!text) return ''
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }

  let decoded = text
  const entityRegex = /&[a-zA-Z0-9#]+;/g
  let prev
  do {
    prev = decoded
    decoded = prev.replace(entityRegex, (entity) => htmlEntities[entity] || entity)
  } while (prev !== decoded)

  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function coalesceDate(row: StoryRow): { start: string; end: string } {
  const tryParse = (val?: string) => {
    if (!val) return null
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString().slice(0, 10)
  }

  const start =
    tryParse(row.start_date) || tryParse(row.startDate) || tryParse(row.date_start) || '2018-01-01'

  const end =
    tryParse(row.end_date) || tryParse(row.endDate) || tryParse(row.date_end) || '2099-12-31'

  return { start, end }
}

async function importStories() {
  const payload = await getPayload({ config })
  const pool = new Pool({
    host: process.env.DATABASE_URL,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DB_PASS,
    ssl: process.env.DATABASE_SSL_MODE === 'true' ? { rejectUnauthorized: false } : undefined,
  })
  try {
    const dataPath = path.resolve(process.cwd(), 'data', 'stories2.json')
    const raw = await fs.readFile(dataPath, 'utf8')
    const rows: StoryRow[] = JSON.parse(raw)

    console.log(`Found ${rows.length} story rows to import`)

    let created = 0
    let updated = 0
    let skipped = 0

    // Helper to find or create media by URL (same approach as event thumbnails script)
    const findOrCreateMediaByUrl = async (
      imageUrl: string | undefined,
      altText: string,
    ): Promise<number | null> => {
      if (!imageUrl) return null
      try {
        const filename = imageUrl
        const existing = await pool.query('SELECT id FROM media WHERE filename = $1', [filename])
        if (existing.rows.length > 0) {
          return existing.rows[0].id as number
        }
        const inserted = await pool.query(
          `INSERT INTO media (
            filename,
            url,
            mime_type,
            filesize,
            width,
            height,
            alt_en,
            alt_th,
            alt_zh,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
          [filename, imageUrl, 'image/jpeg', 0, 0, 0, altText, altText, altText],
        )
        return inserted.rows[0].id as number
      } catch (err) {
        console.error(`Error creating media for URL ${imageUrl}:`, err)
        return null
      }
    }

    for (const row of rows) {
      if (row.id && row.id <= 900) {
        console.log('Skipping story id:', row.id)
        continue
      }
      const originalId = row.id ?? undefined

      // Determine primary locale based on available title
      const primaryLocale: 'en' | 'th' | 'zh' = row.title_en
        ? 'en'
        : row.title_th
          ? 'th'
          : row.title_cn
            ? 'zh'
            : 'en'

      // Build slug preference with primary locale first
      const preferredSlug =
        row.slug?.trim() ||
        (primaryLocale === 'en'
          ? row.url_slug_en?.trim() || row.url_slug_th?.trim() || row.url_slug_cn?.trim()
          : primaryLocale === 'th'
            ? row.url_slug_th?.trim() || row.url_slug_en?.trim() || row.url_slug_cn?.trim()
            : row.url_slug_cn?.trim() || row.url_slug_en?.trim() || row.url_slug_th?.trim()) ||
        (primaryLocale === 'en' && row.title_en ? slugify(row.title_en) : '') ||
        (primaryLocale === 'th' && row.title_th ? slugify(row.title_th) : '') ||
        (primaryLocale === 'zh' && row.title_cn ? slugify(row.title_cn) : '')

      const finalSlug =
        preferredSlug && preferredSlug.length > 0
          ? preferredSlug
          : `story-${originalId ?? Math.random().toString(36).slice(2)}`

      // Localized EN fields only if present (no cross-locale fallback)
      const titleEn = row.title_en ? decodeText(row.title_en) : undefined
      const subtitleEn = row.sub_title_en ? decodeText(row.sub_title_en) : undefined

      const { start, end } = coalesceDate(row)

      // Upsert target: original id or slug
      let existingId: string | null = null
      try {
        if (originalId != null) {
          const byOriginal = await payload.find({
            collection: 'stories',
            where: { 'system.original_id': { equals: originalId } },
            limit: 1,
          })
          if (byOriginal.docs.length > 0) existingId = String(byOriginal.docs[0].id)
        }
        if (!existingId) {
          const bySlug = await payload.find({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            limit: 1,
          })
          if (bySlug.docs.length > 0) existingId = String(bySlug.docs[0].id)
        }
      } catch (e) {
        // continue; treat as not found
      }

      const baseNonLocalized: any = {
        slug: finalSlug,
        status: 'ACTIVE',
        pin_to_home: false,
        pin_to_section: false,
        sort_order: typeof originalId === 'number' ? originalId : 0,
        system: {
          original_id: originalId ?? null,
          cid: row.cid != null ? String(row.cid) : undefined,
          scid: row.scid != null ? String(row.scid) : undefined,
          create_by: row.create_by || undefined,
          modified_at: row.modified_at || undefined,
        },
        start_date: start,
        end_date: end,
      }

      const enData: any = {}
      if (titleEn) enData.title = titleEn
      if (subtitleEn) enData.subtitle = subtitleEn
      if (row.seo_keyword_en || row.seo_desc_en) {
        enData.seo = {
          keywords: decodeText(row.seo_keyword_en || ''),
          description: decodeText(row.seo_desc_en || ''),
        }
      }

      const thData: any = {}
      if (row.title_th) thData.title = decodeText(row.title_th)
      if (row.sub_title_th) thData.subtitle = decodeText(row.sub_title_th)
      if (row.seo_keyword_th || row.seo_desc_th) {
        thData.seo = {
          keywords: decodeText(row.seo_keyword_th || ''),
          description: decodeText(row.seo_desc_th || ''),
        }
      }
      // content optionally patched below from text_th

      const zhData: any = {}
      if (row.title_cn) zhData.title = decodeText(row.title_cn)
      if (row.sub_title_cn) zhData.subtitle = decodeText(row.sub_title_cn)
      if (row.seo_keyword_cn || row.seo_desc_cn) {
        zhData.seo = {
          keywords: decodeText(row.seo_keyword_cn || ''),
          description: decodeText(row.seo_desc_cn || ''),
        }
      }

      try {
        if (existingId) {
          // Update primary locale first
          const primaryData =
            primaryLocale === 'en' ? enData : primaryLocale === 'th' ? thData : zhData
          await payload.update({
            collection: 'stories',
            id: existingId,
            data: { ...baseNonLocalized, ...(primaryData || {}) },
            locale: primaryLocale,
          })

          if (Object.keys(thData).length > 0 && primaryLocale !== 'th') {
            await payload.update({
              collection: 'stories',
              id: existingId,
              data: thData,
              locale: 'th',
            })
          }
          if (Object.keys(zhData).length > 0 && primaryLocale !== 'zh') {
            await payload.update({
              collection: 'stories',
              id: existingId,
              data: zhData,
              locale: 'zh',
            })
          }
          if (Object.keys(enData).length > 0 && primaryLocale !== 'en') {
            await payload.update({
              collection: 'stories',
              id: existingId,
              data: enData,
              locale: 'en',
            })
          }
          updated++
          console.log(`🔄 Updated story id=${existingId} slug=${finalSlug}`)
        } else {
          // Create with primary locale only
          const createLocaleData =
            primaryLocale === 'en' ? enData : primaryLocale === 'th' ? thData : zhData
          const createdDoc = await payload.create({
            collection: 'stories',
            data: { ...baseNonLocalized, ...(createLocaleData || {}) },
            locale: primaryLocale,
          })
          const newId = String(createdDoc.id)
          if (Object.keys(thData).length > 0 && primaryLocale !== 'th') {
            await payload.update({ collection: 'stories', id: newId, data: thData, locale: 'th' })
          }
          if (Object.keys(zhData).length > 0 && primaryLocale !== 'zh') {
            await payload.update({ collection: 'stories', id: newId, data: zhData, locale: 'zh' })
          }
          if (Object.keys(enData).length > 0 && primaryLocale !== 'en') {
            await payload.update({ collection: 'stories', id: newId, data: enData, locale: 'en' })
          }
          created++
          console.log(`✅ Created story id=${newId} slug=${finalSlug}`)
        }

        // Patch rich text content per locale (HTML → store as any, as done in events patch)
        if (row.text_en) {
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { content: decodeText(row.text_en) as any },
            locale: 'en',
          })
        }
        if (row.text_th) {
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { content: decodeText(row.text_th) as any },
            locale: 'th',
          })
        }
        if (row.text_cn) {
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { content: decodeText(row.text_cn) as any },
            locale: 'zh',
          })
        }

        // Patch images per locale similarly to event thumbnails script, with fallback
        // Build generic media ids once
        const genericTitle = decodeText(row.title_th || row.title_en || row.title_cn || finalSlug)
        const genThumb = await findOrCreateMediaByUrl(
          row.image_thumbnail,
          `Thumbnail for ${genericTitle}`,
        )
        const genCover = await findOrCreateMediaByUrl(
          row.cover_photo,
          `Cover photo for ${genericTitle}`,
        )
        const genFb = await findOrCreateMediaByUrl(
          row.facebook_image_url,
          `Facebook image for ${genericTitle}`,
        )

        // Thai locale: use generic
        if (genThumb || genCover || genFb) {
          const imagesTh: any = {}
          if (genThumb) imagesTh.thumbnail = genThumb
          if (genCover) imagesTh.cover_photo = genCover
          if (genFb) imagesTh.facebook_image = genFb
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { images: imagesTh },
            locale: 'th',
          })
        }

        // English locale: prefer EN-specific else generic
        const enAlt = decodeText(row.title_en || genericTitle)
        const thumbEn = await findOrCreateMediaByUrl(
          row.image_thumbnail_en || undefined,
          `Thumbnail for ${enAlt}`,
        )
        const coverEn = await findOrCreateMediaByUrl(
          row.cover_photo_en || undefined,
          `Cover photo for ${enAlt}`,
        )
        const fbEn = await findOrCreateMediaByUrl(
          row.facebook_image_url_en || undefined,
          `Facebook image for ${enAlt}`,
        )
        if (thumbEn || coverEn || fbEn || genThumb || genCover || genFb) {
          const imagesEn: any = {}
          if (thumbEn || genThumb) imagesEn.thumbnail = thumbEn || genThumb
          if (coverEn || genCover) imagesEn.cover_photo = coverEn || genCover
          if (fbEn || genFb) imagesEn.facebook_image = fbEn || genFb
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { images: imagesEn },
            locale: 'en',
          })
        }

        // Chinese locale: prefer ZH-specific else generic
        const zhAlt = decodeText(row.title_cn || genericTitle)
        const thumbZh = await findOrCreateMediaByUrl(
          row.image_thumbnail_cn || undefined,
          `Thumbnail for ${zhAlt}`,
        )
        const coverZh = await findOrCreateMediaByUrl(
          row.cover_photo_cn || undefined,
          `Cover photo for ${zhAlt}`,
        )
        const fbZh = await findOrCreateMediaByUrl(
          row.facebook_image_url_cn || undefined,
          `Facebook image for ${zhAlt}`,
        )
        if (thumbZh || coverZh || fbZh || genThumb || genCover || genFb) {
          const imagesZh: any = {}
          if (thumbZh || genThumb) imagesZh.thumbnail = thumbZh || genThumb
          if (coverZh || genCover) imagesZh.cover_photo = coverZh || genCover
          if (fbZh || genFb) imagesZh.facebook_image = fbZh || genFb
          await payload.update({
            collection: 'stories',
            where: { slug: { equals: finalSlug } },
            data: { images: imagesZh },
            locale: 'zh',
          })
        }
      } catch (err) {
        skipped++
        console.error(
          `❌ Failed to upsert story slug=${finalSlug} (original_id=${originalId}):`,
          err,
        )
      }
    }

    console.log('— Stories import summary —')
    console.log(`Created: ${created}`)
    console.log(`Updated: ${updated}`)
    console.log(`Failed: ${skipped}`)
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    try {
      // Close pool if created
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (pool as any)?.end?.()
    } catch {}
    process.exit(0)
  }
}

importStories()
