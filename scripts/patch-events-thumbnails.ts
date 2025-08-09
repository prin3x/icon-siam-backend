import { getPayload } from 'payload'
import { readFileSync } from 'fs'
import { join } from 'path'
import config from '../src/payload.config'
import { Pool } from 'pg'

interface LegacyEvent {
  id: number
  slug: string
  title_th: string
  title_en: string
  title_cn: string
  sub_title_th: string
  sub_title_en: string
  sub_title_cn: string
  description_th: string
  description_en: string
  description_cn: string
  text_th: string
  text_en: string
  text_cn: string
  seo_keyword_th: string
  seo_keyword_en: string
  seo_keyword_cn: string
  seo_desc_th: string
  seo_desc_en: string
  seo_desc_cn: string
  cid: string
  scid: string
  image_thumbnail: string
  cover_photo: string
  image_thumbnail_en: string
  cover_photo_en: string
  image_thumbnail_cn: string
  cover_photo_cn: string
  facebook_image_url: string
  facebook_image_url_en: string
  facebook_image_url_cn: string
  highlight: string
  section_highlight: string
  short_alphabet: string
  promotion_type: string
  tags: string
  related_content: string
  related_content_promotion: string
  create_by: string
  showDateStart: string
  showDateEnd: string
  showTime: string
  created_at: string
  modified_at: string
  start_date: string
  end_date: string
  active: number
  pin_to_home: number
  pin_to_section: number
  sort: number
}

async function findOrCreateMediaByUrl(pool: Pool, imageUrl: string, altText: string = '') {
  if (!imageUrl) return null

  try {
    // Use entire URL as filename
    const filename = imageUrl

    // Try to find existing media by filename
    const existingMediaResult = await pool.query('SELECT id FROM media WHERE filename = $1', [
      filename,
    ])

    if (existingMediaResult.rows.length > 0) {
      console.log(`Found existing media for ${filename}`)
      return existingMediaResult.rows[0].id
    }

    // Create new media record directly in database
    console.log(`Creating new media record for ${filename}`)
    const newMediaResult = await pool.query(
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

    return newMediaResult.rows[0].id
  } catch (error) {
    console.error(`Error finding/creating media for URL ${imageUrl}:`, error)
    return null
  }
}

async function patchEventsThumbnails() {
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
    // Read the JSON file
    const jsonPath = join(process.cwd(), 'data', 'events-table-export-2.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const legacyEvents: LegacyEvent[] = JSON.parse(jsonData)

    console.log(`Found ${legacyEvents.length} events to update thumbnails for`)

    let updated = 0
    let errors = 0

    for (const legacyEvent of legacyEvents) {
      if (legacyEvent.id !== 378) continue
      try {
        let updatedLocales = []

        // Handle Thai locale
        if (
          legacyEvent.image_thumbnail ||
          legacyEvent.cover_photo ||
          legacyEvent.facebook_image_url
        ) {
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_th,
              },
            },
            locale: 'th',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            const eventId = existingEvents.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyEvent.image_thumbnail) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.image_thumbnail,
                `Thumbnail for ${legacyEvent.title_th}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyEvent.cover_photo) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.cover_photo,
                `Cover photo for ${legacyEvent.title_th}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyEvent.facebook_image_url) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.facebook_image_url,
                `Facebook image for ${legacyEvent.title_th}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'events',
                id: eventId,
                data: updateData,
                locale: 'th',
              })
              updatedLocales.push('th')
            }
          }
        }

        // Handle English locale
        if (
          legacyEvent.image_thumbnail_en ||
          legacyEvent.cover_photo_en ||
          legacyEvent.facebook_image_url_en
        ) {
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_en,
              },
            },
            locale: 'en',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            const eventId = existingEvents.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyEvent.image_thumbnail_en) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.image_thumbnail_en,
                `Thumbnail for ${legacyEvent.title_en}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyEvent.cover_photo_en) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.cover_photo_en,
                `Cover photo for ${legacyEvent.title_en}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyEvent.facebook_image_url_en) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.facebook_image_url_en,
                `Facebook image for ${legacyEvent.title_en}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'events',
                id: eventId,
                data: updateData,
                locale: 'en',
              })
              updatedLocales.push('en')
            }
          }
        }

        // Handle Chinese locale
        if (
          legacyEvent.image_thumbnail_cn ||
          legacyEvent.cover_photo_cn ||
          legacyEvent.facebook_image_url_cn
        ) {
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_cn,
              },
            },
            locale: 'zh',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            const eventId = existingEvents.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyEvent.image_thumbnail_cn) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.image_thumbnail_cn,
                `Thumbnail for ${legacyEvent.title_cn}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyEvent.cover_photo_cn) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.cover_photo_cn,
                `Cover photo for ${legacyEvent.title_cn}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyEvent.facebook_image_url_cn) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyEvent.facebook_image_url_cn,
                `Facebook image for ${legacyEvent.title_cn}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'events',
                id: eventId,
                data: updateData,
                locale: 'zh',
              })
              updatedLocales.push('zh')
            }
          }
        }

        if (updatedLocales.length > 0) {
          updated++
          console.log(
            `✅ Updated thumbnails for event ID: ${legacyEvent.id} (locales: ${updatedLocales.join(', ')})`,
          )
        } else {
          console.log(`⚠️  No existing event found for ID ${legacyEvent.id} - skipping`)
        }
      } catch (error) {
        errors++
        console.error(`Error processing event ID ${legacyEvent.id}:`, error)
      }
    }

    console.log(`\nThumbnail update complete:`)
    console.log(`- Updated events: ${updated}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('Error reading JSON file:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run the script
patchEventsThumbnails().catch(console.error)
