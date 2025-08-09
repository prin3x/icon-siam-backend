import { getPayload } from 'payload'
import { readFileSync } from 'fs'
import { join } from 'path'
import config from '../src/payload.config'
import { Pool } from 'pg'

interface LegacyPromotion {
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

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return text

  // Create a temporary element to decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// Alternative method for Node.js environment (since document is not available)
function decodeHtmlEntitiesNode(text: string): string {
  if (!text) return text

  return (
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
      .replace(/&#x2B;/g, '+')
      // Handle numeric HTML entities
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      // Handle hexadecimal HTML entities
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  )
}

async function patchPromotionsThumbnails() {
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
    const jsonPath = join(process.cwd(), 'data', 'promotions-table-export-2.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const legacyPromotions: LegacyPromotion[] = JSON.parse(jsonData)

    console.log(`Found ${legacyPromotions.length} promotions to update thumbnails for`)

    let updated = 0
    let errors = 0

    for (const legacyPromotion of legacyPromotions) {
      try {
        let updatedLocales = []

        // Handle Thai locale
        if (
          legacyPromotion.image_thumbnail ||
          legacyPromotion.cover_photo ||
          legacyPromotion.facebook_image_url
        ) {
          // Decode HTML entities in the title
          const decodedTitle = decodeHtmlEntitiesNode(legacyPromotion.title_th)

          let existingPromotions = await payload.find({
            collection: 'promotions',
            where: {
              title: {
                equals: decodedTitle,
              },
              'system.original_id': {
                equals: legacyPromotion.id,
              },
            },
            locale: 'th',
            limit: 1,
          })

          // If not found with decoded title, try with original title
          if (existingPromotions.docs.length === 0) {
            console.log(`  Trying fallback search for Thai: "${legacyPromotion.title_th}"`)
            existingPromotions = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  equals: legacyPromotion.title_th,
                },
                'system.original_id': {
                  equals: legacyPromotion.id,
                },
              },
              locale: 'th',
              limit: 1,
            })
          } else {
            console.log(`  Found with decoded title: "${decodedTitle}"`)
          }

          if (existingPromotions.docs.length > 0) {
            const promotionId = existingPromotions.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyPromotion.image_thumbnail) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.image_thumbnail,
                `Thumbnail for ${legacyPromotion.title_th}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyPromotion.cover_photo) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.cover_photo,
                `Cover photo for ${legacyPromotion.title_th}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyPromotion.facebook_image_url) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.facebook_image_url,
                `Facebook image for ${legacyPromotion.title_th}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'promotions',
                id: promotionId,
                data: updateData,
                locale: 'th',
              })
              updatedLocales.push('th')
            }
          }
        }

        // Handle English locale
        if (legacyPromotion.title_en) {
          // Decode HTML entities in the title
          const decodedTitle = decodeHtmlEntitiesNode(legacyPromotion.title_en)

          let existingPromotions = await payload.find({
            collection: 'promotions',
            where: {
              title: {
                exists: true,
              },
              'system.original_id': {
                equals: legacyPromotion.id,
              },
            },
            locale: 'en',
            limit: 1,
          })

          // If not found with decoded title, try with original title
          if (existingPromotions.docs.length === 0) {
            console.log(`  Trying fallback search for English: "${legacyPromotion.title_en}"`)
            existingPromotions = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  exists: true,
                },
                'system.original_id': {
                  equals: legacyPromotion.id,
                },
              },
              locale: 'en',
              limit: 1,
            })
          } else {
            console.log(`  Found with decoded title: "${decodedTitle}"`)
          }

          if (existingPromotions.docs.length > 0) {
            const promotionId = existingPromotions.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyPromotion.image_thumbnail_en || legacyPromotion.image_thumbnail) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.image_thumbnail_en || legacyPromotion.image_thumbnail,
                `Thumbnail for ${legacyPromotion.title_en}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyPromotion.cover_photo_en || legacyPromotion.image_thumbnail) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.cover_photo_en || legacyPromotion.image_thumbnail,
                `Cover photo for ${legacyPromotion.title_en}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyPromotion.facebook_image_url_en) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.facebook_image_url_en,
                `Facebook image for ${legacyPromotion.title_en}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'promotions',
                id: promotionId,
                data: updateData,
                locale: 'en',
              })
              updatedLocales.push('en')
            }
          }
        }

        // Handle Chinese locale
        if (legacyPromotion.title_cn) {
          // Decode HTML entities in the title
          const decodedTitle = decodeHtmlEntitiesNode(legacyPromotion.title_cn)

          let existingPromotions = await payload.find({
            collection: 'promotions',
            where: {
              title: {
                exists: true,
              },
              'system.original_id': {
                equals: legacyPromotion.id,
              },
            },
            locale: 'zh',
            limit: 1,
          })

          // If not found with decoded title, try with original title
          if (existingPromotions.docs.length === 0) {
            console.log(`  Trying fallback search for Chinese: "${legacyPromotion.title_cn}"`)
            existingPromotions = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  exists: true,
                },
                'system.original_id': {
                  equals: legacyPromotion.id,
                },
              },
              locale: 'zh',
              limit: 1,
            })
          } else {
            console.log(`  Found with decoded title cn: "${decodedTitle}"`)
          }

          if (existingPromotions.docs.length > 0) {
            const promotionId = existingPromotions.docs[0].id
            const updateData: any = {
              images: {},
            }

            // Find or create media for thumbnail
            if (legacyPromotion.image_thumbnail_cn || legacyPromotion.image_thumbnail) {
              const thumbnailMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.image_thumbnail_cn || legacyPromotion.image_thumbnail,
                `Thumbnail for ${legacyPromotion.title_cn}`,
              )
              if (thumbnailMediaId) {
                updateData.images.thumbnail = thumbnailMediaId
              }
            }

            // Find or create media for cover photo
            if (legacyPromotion.cover_photo_cn || legacyPromotion.cover_photo) {
              const coverMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.cover_photo_cn || legacyPromotion.cover_photo,
                `Cover photo for ${legacyPromotion.title_cn}`,
              )
              if (coverMediaId) {
                updateData.images.cover_photo = coverMediaId
              }
            }

            // Find or create media for facebook image
            if (legacyPromotion.facebook_image_url_cn || legacyPromotion.facebook_image_url) {
              const facebookMediaId = await findOrCreateMediaByUrl(
                pool,
                legacyPromotion.facebook_image_url_cn || legacyPromotion.facebook_image_url,
                `Facebook image for ${legacyPromotion.title_cn}`,
              )
              if (facebookMediaId) {
                updateData.images.facebook_image = facebookMediaId
              }
            }

            if (Object.keys(updateData.images).length > 0) {
              await payload.update({
                collection: 'promotions',
                id: promotionId,
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
            `✅ Updated thumbnails for promotion ID: ${legacyPromotion.id} (locales: ${updatedLocales.join(', ')})`,
          )
        } else {
          console.log(`⚠️  No existing promotion found for ID ${legacyPromotion.id} - skipping`)
          console.log(`  Thai title: "${legacyPromotion.title_th}"`)
          console.log(`  English title: "${legacyPromotion.title_en}"`)
          console.log(`  Chinese title: "${legacyPromotion.title_cn}"`)
        }
      } catch (error) {
        errors++
        console.error(`Error processing promotion ID ${legacyPromotion.id}:`, error)
      }
    }

    console.log(`\nThumbnail update complete:`)
    console.log(`- Updated promotions: ${updated}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('Error reading JSON file:', error)
  } finally {
    process.exit(0)
  }
}

// Run the script
patchPromotionsThumbnails().catch(console.error)
