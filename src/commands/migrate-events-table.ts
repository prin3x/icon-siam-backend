import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface EventsTableRecord {
  id: number
  slug: string
  title_th: string
  title_en: string
  title_cn: string
  sub_title_th: string
  sub_title_en: string
  sub_title_cn: string
  url_slug_th: string
  url_slug_en: string
  url_slug_cn: string
  description_th: string
  description_en: string
  description_cn: string
  seo_keyword_th: string
  seo_keyword_en: string
  seo_keyword_cn: string
  seo_desc_th: string
  seo_desc_en: string
  seo_desc_cn: string
  text_th: string
  text_en: string
  text_cn: string
  cid: number
  scid: number
  image_thumbnail: string
  cover_photo: string
  image_thumbnail_en: string
  cover_photo_en: string
  image_thumbnail_cn: string
  cover_photo_cn: string
  highlight: string
  section_highlight: string
  short_alphabet: string
  related_content: string
  promotion_type: string
  tags: string
  floor: string
  zone: string
  related_content_promotion: string
  create_by: string
  facebook_image_url: string
  facebook_image_url_en: string
  facebook_image_url_cn: string
  showDateStart: string
  showDateEnd: string
  showTime: string
  created_at: string
  modified_at: string
  start_date: string
  end_date: string
  active: number
  sort: number
}

// Utility to decode HTML entities and unicode escapes
function decodeText(text: string | null | undefined): string {
  if (!text) return ''
  // Decode HTML entities
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

  // Decode numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  // Decode unicode escapes
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

// Utility to convert plain text to Lexical richText structure
function textToLexical(text: string): any {
  if (!text || text.trim() === '') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: '',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    }
  }

  const decodedText = decodeText(text)

  // For HTML content, create paragraphs from block-level tags and strip inline tags.
  const paragraphs = decodedText
    .replace(/<br\s*\/?>/gi, '\n') // Handle <br> tags
    .replace(/<\/div>/gi, '\n') // Handle <div> tags
    .replace(/<\/p>/gi, '\n') // Handle <p> tags
    .split('\n')
    .map((p) => {
      // For each paragraph, strip all remaining HTML tags to get clean text.
      return p.replace(/<[^>]*>?/gm, '').trim()
    })
    .filter((p) => p.length > 0)

  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        mode: 'normal',
        text: paragraph,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
  }))

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: children.length
        ? children
        : [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: '' }],
            },
          ],
      direction: 'ltr',
    },
  }
}

async function migrateEventsTable() {
  const payload = await getPayload({ config })

  try {
    console.log('===*** Starting Events Migration ***===')

    // Read the events data
    const eventsDataPath = path.join(process.cwd(), 'data', 'events-table-export-3.json')
    const eventsData = JSON.parse(fs.readFileSync(eventsDataPath, 'utf8'))
    console.log(`Found ${eventsData.length} events to migrate`)

    // Create a map to store media records
    const mediaMap = new Map<string, string>()
    const categoryMap = new Map<string, string>()

    async function findOrCreateCategory(
      cid: string | number,
      type: 'events' | 'promotions',
    ): Promise<string | null> {
      if (!cid) return null
      const cidStr = cid.toString()

      if (categoryMap.has(cidStr)) {
        return categoryMap.get(cidStr)!
      }

      try {
        // Find existing category
        const existingCategory = await payload.find({
          collection: 'categories',
          where: {
            original_id: {
              equals: cidStr,
            },
            type: {
              equals: type,
            },
          },
          limit: 1,
        })

        if (existingCategory.docs.length > 0) {
          const catId = existingCategory.docs[0]?.id
          categoryMap.set(cidStr, catId?.toString() || '')
          return catId?.toString() || ''
        }

        // Create new category if not found
        // Handle non-numeric cid values by creating a sanitized slug
        let categoryName: string
        let categorySlug: string

        if (isNaN(Number(cidStr))) {
          // For non-numeric cid values, use the cid as the name and create a sanitized slug
          categoryName = cidStr
          categorySlug = `${type}-${cidStr
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')}`
        } else {
          // For numeric cid values, use the original logic
          categoryName = `${type.charAt(0).toUpperCase() + type.slice(1)} Category ${cidStr}`
          categorySlug = `${type}-category-${cidStr}`
        }

        const newCategory = await payload.create({
          collection: 'categories',
          data: {
            name: categoryName,
            slug: categorySlug,
            type: type,
            original_id: cidStr,
            status: 'ACTIVE',
          },
        })

        console.log(`✅ Created category: ${categoryName} (slug: ${categorySlug})`)
        categoryMap.set(cidStr, newCategory.id.toString())
        return newCategory.id.toString()
      } catch (error) {
        console.error(`❌ Error finding or creating category for cid ${cidStr}:`, error)
        return null
      }
    }

    // Helper function to create media record with better duplicate detection
    async function createMediaRecord(imageUrl: string): Promise<string | null> {
      if (!imageUrl || imageUrl.trim() === '') return null

      // Check if we already created this media record
      if (mediaMap.has(imageUrl)) {
        return mediaMap.get(imageUrl)!
      }

      try {
        const filename = imageUrl.split('/').pop() || `event-image-${Date.now()}.jpg`

        // Check if media with this URL already exists (more reliable than filename)
        const existingMediaByUrl = await payload.find({
          collection: 'media',
          where: {
            url: {
              equals: imageUrl,
            },
          },
          limit: 1,
        })

        if (existingMediaByUrl.docs.length > 0) {
          // Use existing media record by URL
          const existingId = existingMediaByUrl.docs[0]?.id?.toString()
          if (existingId) {
            mediaMap.set(imageUrl, existingId)
            console.log(`Reused existing media by URL: ${filename} (ID: ${existingId})`)
            return existingId
          }
        }

        // Check if media with this filename already exists
        const existingMedia = await payload.find({
          collection: 'media',
          where: {
            filename: {
              equals: filename,
            },
          },
          limit: 1,
        })

        if (existingMedia.docs.length > 0) {
          // Use existing media record
          const existingId = existingMedia.docs[0]?.id?.toString()
          if (existingId) {
            mediaMap.set(imageUrl, existingId)
            console.log(`Reused existing media by filename: ${filename} (ID: ${existingId})`)
            return existingId
          }
        }

        // Create new media record
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: {
              en: filename,
              th: filename,
              zh: filename,
            },
            filename: filename,
            url: imageUrl,
            width: 800, // Default width
            height: 600, // Default height
            mimeType: 'image/jpeg', // Default mime type
            filesize: 0, // Will be set by Payload
          },
        })

        mediaMap.set(imageUrl, media.id.toString())
        console.log(`Created new media: ${filename} (ID: ${media.id})`)
        return media.id.toString()
      } catch (error) {
        console.error(`Error creating media record for ${imageUrl}:`, error)
        return null
      }
    }

    let eventsCreated = 0
    let eventsUpdated = 0
    let errorCount = 0

    for (const record of eventsData) {
      try {
        console.log(`Processing event: ${record.title_en || record.title_th || record.id}`)

        // Parse dates
        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr.trim() === '') return null
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
        }

        // Create media records for images
        const imageThumbnailId_th = await createMediaRecord(record.image_thumbnail)
        const imageThumbnailId_en = await createMediaRecord(record.image_thumbnail_en)
        const imageThumbnailId_cn = await createMediaRecord(record.image_thumbnail_cn)
        const coverPhotoId_th = await createMediaRecord(record.cover_photo)
        const coverPhotoId_en = await createMediaRecord(record.cover_photo_en)
        const coverPhotoId_cn = await createMediaRecord(record.cover_photo_cn)
        const facebookImageId_th = await createMediaRecord(record.facebook_image_url)
        const facebookImageId_en = await createMediaRecord(record.facebook_image_url_en)
        const facebookImageId_cn = await createMediaRecord(record.facebook_image_url_cn)

        const categoryId = await findOrCreateCategory(record.cid, 'events')

        // Parse status
        const status = record.active === 1 ? ('ACTIVE' as const) : ('INACTIVE' as const)

        // Parse keywords
        const keywordsArray = []
        if (record.tags) {
          const tags = decodeText(record.tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
          keywordsArray.push(...tags.map((tag) => ({ keyword: tag })))
        }

        // Create location data
        const location = {
          name: decodeText(record.zone || ''),
          address: decodeText(record.zone || ''),
        }

        // Create meta data
        const meta = {
          title: decodeText(record.seo_desc_en || record.seo_desc_th || ''),
          description: decodeText(record.seo_desc_en || record.seo_desc_th || ''),
        }

        // Create the event record (only if English title exists)
        let eventData = null
        if (record.title_en && record.title_en.trim()) {
          eventData = {
            title: decodeText(record.title_en),
            subtitle: decodeText(record.sub_title_en),
            description: decodeText(record.description_en),
            content: textToLexical(record.text_en),
            highlight: decodeText(record.highlight || ''),
            section_highlight: decodeText(record.section_highlight || ''),
            short_alphabet: decodeText(record.short_alphabet || ''),
            start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
            end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
            show_time: decodeText(record.showTime || ''),
            status: status,
            is_featured: false,
            sort_order: record.sort || 0,
            images: {
              cover_photo: coverPhotoId_en ? parseInt(coverPhotoId_en) : null,
              thumbnail: imageThumbnailId_en ? parseInt(imageThumbnailId_en) : null,
              facebook_image: facebookImageId_en ? parseInt(facebookImageId_en) : null,
            },
            location: {
              name: decodeText(record.zone || ''),
              address: decodeText(record.zone || ''),
              floor: null, // Will need to be mapped to floor ID if needed
              zone: decodeText(record.zone || ''),
            },
            relationships: {
              categories: categoryId ? [parseInt(categoryId)] : [],
              related_content: [], // Will need to be populated based on related_content field
              related_promotions: [], // Will need to be populated based on related_content_promotion field
            },
            promotion_type: record.promotion_type || 'none',
            keywords: keywordsArray,
            meta: {
              title: decodeText(record.seo_desc_en),
              description: decodeText(record.seo_desc_en),
              keywords: decodeText(record.seo_keyword_en),
            },
            system: {
              original_id: record.id,
              cid: record.cid || null,
              scid: record.scid || null,
              create_by: decodeText(record.create_by || ''),
              modified_at: parseDate(record.modified_at),
            },
            slug: record.slug || `event-${record.id}`,
          }
        }

        // Check if event record already exists by slug first (more reliable)
        const existingEventBySlug = await payload.find({
          collection: 'events',
          where: {
            slug: {
              equals: record.slug || `event-${record.id}`,
            },
          },
          limit: 1,
        })

        if (existingEventBySlug.docs.length > 0) {
          // Update existing event record found by slug
          const existingId = existingEventBySlug.docs[0]?.id
          if (!existingId) {
            console.error(
              `Error: Existing event record found by slug but no ID available for: ${record.slug || `event-${record.id}`}`,
            )
            continue
          }

          // Update English locale only if we have English content
          if (eventData) {
            await payload.update({
              collection: 'events',
              id: existingId,
              data: eventData!,
              locale: 'en',
            })
            console.log(
              `Updated English locale for event: ${record.title_en} (${record.slug || `event-${record.id}`})`,
            )
          } else {
            console.log(
              `⏭️ Skipping English locale for event ${record.id}: No English title available`,
            )
          }

          // Update with Thai content
          if (record.title_th) {
            await payload.update({
              collection: 'events',
              id: existingId,
              data: {
                title: decodeText(record.title_th),
                subtitle: decodeText(record.sub_title_th),
                description: decodeText(record.description_th),
                content: textToLexical(record.text_th),
                images: {
                  cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                  thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                  facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                },
                location: {
                  name: decodeText(record.zone || ''),
                  address: decodeText(record.zone || ''),
                  floor: null,
                  zone: decodeText(record.zone || ''),
                },
                meta: {
                  title: decodeText(record.seo_desc_th),
                  description: decodeText(record.seo_desc_th),
                  keywords: decodeText(record.seo_keyword_th),
                },
              },
              locale: 'th',
            })
            console.log(
              `Updated Thai locale for event: ${record.title_th} (${record.slug || `event-${record.id}`})`,
            )
          }

          // Update with Chinese content
          if (record.title_cn) {
            await payload.update({
              collection: 'events',
              id: existingId,
              data: {
                title: decodeText(record.title_cn),
                subtitle: decodeText(record.sub_title_cn),
                description: decodeText(record.description_cn),
                content: textToLexical(record.text_cn),
                images: {
                  cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                  thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                  facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                },
                location: {
                  name: decodeText(record.zone || ''),
                  address: decodeText(record.zone || ''),
                  floor: null,
                  zone: decodeText(record.zone || ''),
                },
                meta: {
                  title: decodeText(record.seo_desc_cn),
                  description: decodeText(record.seo_desc_cn),
                  keywords: decodeText(record.seo_keyword_cn),
                },
              },
              locale: 'zh',
            })
            console.log(
              `Updated Chinese locale for event: ${record.title_cn} (${record.slug || `event-${record.id}`})`,
            )
          }

          eventsUpdated++
          console.log(
            `Updated existing event by slug: ${record.title_en || record.title_th || 'Untitled'} (${record.slug || `event-${record.id}`})`,
          )
        } else {
          // Check if event record already exists by English title (only if we have English content)
          let existingEvent = null
          if (eventData) {
            existingEvent = await payload.find({
              collection: 'events',
              where: {
                title: {
                  equals: decodeText(record.title_en),
                },
              },
              locale: 'en',
              limit: 1,
            })
          }

          if (existingEvent && existingEvent.docs.length > 0) {
            // Update existing event record found by title
            const existingId = existingEvent.docs[0]?.id
            if (!existingId) {
              console.error(
                `Error: Existing event record found by title but no ID available for: ${record.title_en}`,
              )
              continue
            }

            // Update English locale
            await payload.update({
              collection: 'events',
              id: existingId,
              data: eventData!,
              locale: 'en',
            })

            // Update with Thai content
            if (record.title_th) {
              await payload.update({
                collection: 'events',
                id: existingId,
                data: {
                  title: decodeText(record.title_th),
                  subtitle: decodeText(record.sub_title_th),
                  description: decodeText(record.description_th),
                  content: textToLexical(record.text_th),
                  images: {
                    cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                    thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                    facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                  },
                  location: {
                    name: decodeText(record.zone || ''),
                    address: decodeText(record.zone || ''),
                    floor: null,
                    zone: decodeText(record.zone || ''),
                  },
                  meta: {
                    title: decodeText(record.seo_desc_th),
                    description: decodeText(record.seo_desc_th),
                    keywords: decodeText(record.seo_keyword_th),
                  },
                },
                locale: 'th',
              })
            }

            // Update with Chinese content
            if (record.title_cn) {
              await payload.update({
                collection: 'events',
                id: existingId,
                data: {
                  title: decodeText(record.title_cn),
                  subtitle: decodeText(record.sub_title_cn),
                  description: decodeText(record.description_cn),
                  content: textToLexical(record.text_cn),
                  images: {
                    cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                    thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                    facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                  },
                  location: {
                    name: decodeText(record.zone || ''),
                    address: decodeText(record.zone || ''),
                    floor: null,
                    zone: decodeText(record.zone || ''),
                  },
                  meta: {
                    title: decodeText(record.seo_desc_cn),
                    description: decodeText(record.seo_desc_cn),
                    keywords: decodeText(record.seo_keyword_cn),
                  },
                },
                locale: 'zh',
              })
            }

            eventsUpdated++
            console.log(
              `Updated existing event by title: ${record.title_en || record.title_th || 'Untitled'} (${record.slug || `event-${record.id}`})`,
            )
          } else {
            // Create new event record - we need at least one locale to create the record
            // Use the first available locale (Thai, Chinese, or English)
            let createLocale: 'en' | 'th' | 'zh' = 'en'
            let createData: any = null

            if (eventData) {
              createData = eventData
              createLocale = 'en'
            } else if (record.title_th) {
              createLocale = 'th'
              createData = {
                title: decodeText(record.title_th),
                subtitle: decodeText(record.sub_title_th),
                description: decodeText(record.description_th),
                content: textToLexical(record.text_th),
                highlight: decodeText(record.highlight || ''),
                section_highlight: decodeText(record.section_highlight || ''),
                short_alphabet: decodeText(record.short_alphabet || ''),
                start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
                end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
                show_time: decodeText(record.showTime || ''),
                status: status,
                is_featured: false,
                sort_order: record.sort || 0,
                images: {
                  cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                  thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                  facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                },
                location: {
                  name: decodeText(record.zone || ''),
                  address: decodeText(record.zone || ''),
                  floor: null,
                  zone: decodeText(record.zone || ''),
                },
                relationships: {
                  categories: categoryId ? [parseInt(categoryId)] : [],
                  related_content: [],
                  related_promotions: [],
                },
                promotion_type: record.promotion_type || 'none',
                keywords: keywordsArray,
                meta: {
                  title: decodeText(record.seo_desc_th),
                  description: decodeText(record.seo_desc_th),
                  keywords: decodeText(record.seo_keyword_th),
                },
                system: {
                  original_id: record.id,
                  cid: record.cid || null,
                  scid: record.scid || null,
                  create_by: decodeText(record.create_by || ''),
                  modified_at: parseDate(record.modified_at),
                },
                slug: record.slug || `event-${record.id}`,
              }
            } else if (record.title_cn) {
              createLocale = 'zh'
              createData = {
                title: decodeText(record.title_cn),
                subtitle: decodeText(record.sub_title_cn),
                description: decodeText(record.description_cn),
                content: textToLexical(record.text_cn),
                highlight: decodeText(record.highlight || ''),
                section_highlight: decodeText(record.section_highlight || ''),
                short_alphabet: decodeText(record.short_alphabet || ''),
                start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
                end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
                show_time: decodeText(record.showTime || ''),
                status: status,
                is_featured: false,
                sort_order: record.sort || 0,
                images: {
                  cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                  thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                  facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                },
                location: {
                  name: decodeText(record.zone || ''),
                  address: decodeText(record.zone || ''),
                  floor: null,
                  zone: decodeText(record.zone || ''),
                },
                relationships: {
                  categories: categoryId ? [parseInt(categoryId)] : [],
                  related_content: [],
                  related_promotions: [],
                },
                promotion_type: record.promotion_type || 'none',
                keywords: keywordsArray,
                meta: {
                  title: decodeText(record.seo_desc_cn),
                  description: decodeText(record.seo_desc_cn),
                  keywords: decodeText(record.seo_keyword_cn),
                },
                system: {
                  original_id: record.id,
                  cid: record.cid || null,
                  scid: record.scid || null,
                  create_by: decodeText(record.create_by || ''),
                  modified_at: parseDate(record.modified_at),
                },
                slug: record.slug || `event-${record.id}`,
              }
            }

            // Only create if we have data for at least one locale
            if (createData) {
              const event = await payload.create({
                collection: 'events',
                data: createData,
                locale: createLocale,
              })

              // Update with other locales if available
              if (createLocale !== 'en' && eventData) {
                await payload.update({
                  collection: 'events',
                  where: { slug: { equals: record.slug || `event-${record.id}` } },
                  data: eventData,
                  locale: 'en',
                })
              }

              if (createLocale !== 'th' && record.title_th) {
                await payload.update({
                  collection: 'events',
                  where: { slug: { equals: record.slug || `event-${record.id}` } },
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    content: textToLexical(record.text_th),
                    images: {
                      cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                      thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                      facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                    },
                    location: {
                      name: decodeText(record.zone || ''),
                      address: decodeText(record.zone || ''),
                      floor: null,
                      zone: decodeText(record.zone || ''),
                    },
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                      keywords: decodeText(record.seo_keyword_th),
                    },
                  },
                  locale: 'th',
                })
              }

              if (createLocale !== 'zh' && record.title_cn) {
                await payload.update({
                  collection: 'events',
                  where: { slug: { equals: record.slug || `event-${record.id}` } },
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    content: textToLexical(record.text_cn),
                    images: {
                      cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                      thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                      facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                    },
                    location: {
                      name: decodeText(record.zone || ''),
                      address: decodeText(record.zone || ''),
                      floor: null,
                      zone: decodeText(record.zone || ''),
                    },
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                      keywords: decodeText(record.seo_keyword_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              eventsCreated++
              console.log(
                `Created new event: ${record.title_en || record.title_th || record.title_cn || 'Untitled'} (${record.slug || `event-${record.id}`})`,
              )
            } else {
              console.log(`⏭️ Skipping event ${record.id}: No content available in any language`)
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing event ${record.id}:`, error)
        errorCount++
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(
      `- Events records: ${eventsCreated} created, ${eventsUpdated} updated (${eventsCreated + eventsUpdated} total)`,
    )
    console.log(`- Total media records processed: ${mediaMap.size}`)
    console.log(`- Total categories processed: ${categoryMap.size}`)
    console.log(`- Errors: ${errorCount} events`)
    console.log(`- Total records processed: ${eventsData.length}`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

migrateEventsTable()
