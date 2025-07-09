import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface DirectTableRecord3 {
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
  seo_keyword_th: string
  seo_keyword_en: string
  seo_keyword_cn: string
  seo_desc_th: string
  seo_desc_en: string
  seo_desc_cn: string
  cid: number
  scid: number
  zone: string
  room_number: string
  shop_logo_url: string
  image_thumbnail: string
  shop_image_slide1: string
  shop_image_slide2: string
  shop_image_slide3: string
  shop_image_slide4: string
  shop_image_slide5: string
  shop_image_slide6: string
  shop_image_slide7: string
  shop_image_slide8: string
  tags: string
  floor: string
  poi_x: number
  poi_y: number
  shop_url: string
  short_alphabet: string
  related_content: string
  related_content_promotion: string
  tel: string
  instagram_url: string
  facebook_url: string
  wechat_account: string
  line_account: string
  weibo_url: string
  facebook_image_url: string
  open_mon: string
  close_mon: string
  checked_mon: number
  open_tue: string
  close_tue: string
  checked_tue: number
  open_wed: string
  close_wed: string
  checked_wed: number
  open_thu: string
  close_thu: string
  checked_thu: number
  open_fri: string
  close_fri: string
  checked_fri: number
  open_sat: string
  close_sat: string
  checked_sat: number
  open_sun: string
  close_sun: string
  checked_sun: number
  created_at: string
  modified_at: string
  create_by: string
  start_date: string
  end_date: string
  active: number
  sort: number
}

// Mapping from numeric scid values to category names based on analysis of direct-table-export-3.json
const scidToCategoryMapping: Record<number, string> = {
  0: 'GENERAL', // Default category for uncategorized items
  25: 'CAFE', // Coffee shops like PunThai Coffee, ChaTraMue
  37: 'HEALTH', // Health-related services
  46: 'DESSERT', // Dessert shops like Double Slash, Durian Mahanakorn
  47: 'RESTAURANT', // Restaurants like Santa Fe', GOGO GYOZA & RAMEN, KATEI SHABU
  56: 'BEAUTY', // Beauty services like BEAUTRIUM, Doctor Delight, Cute Press, Gangnamclinic, Oriental Princess
  58: 'FASHION', // Fashion items like Exodia Era, Hasguard
  70: 'SUPERMARKET', // Supermarkets like Lotus's Prive
  10: 'ENTERTAINMENT', // Entertainment like Joyliday
  13: 'HEALTH', // Health services
  71: 'GENERAL', // General category
  72: 'GENERAL', // General category
  73: 'GENERAL', // General category
}

// Mapping from cid to collection type
const cidToCollectionMap: Record<number, 'shops' | 'dinings'> = {
  7: 'shops', // General shops
  8: 'dinings', // General dinings
  10: 'shops', // Entertainment
  13: 'shops', // Health services
  70: 'shops', // Supermarket
  71: 'shops', // General
  72: 'shops', // General
  73: 'shops', // General
}

// Utility to decode HTML entities and unicode escapes
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
  let decoded = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => htmlEntities[entity] || entity)
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

// Utility to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Utility to parse opening hours
function parseOpeningHours(record: DirectTableRecord3) {
  const hours = []

  const days = [
    {
      day: 'mon' as const,
      open: record.open_mon,
      close: record.close_mon,
      checked: record.checked_mon,
    },
    {
      day: 'tue' as const,
      open: record.open_tue,
      close: record.close_tue,
      checked: record.checked_tue,
    },
    {
      day: 'wed' as const,
      open: record.open_wed,
      close: record.close_wed,
      checked: record.checked_wed,
    },
    {
      day: 'thu' as const,
      open: record.open_thu,
      close: record.close_thu,
      checked: record.checked_thu,
    },
    {
      day: 'fri' as const,
      open: record.open_fri,
      close: record.close_fri,
      checked: record.checked_fri,
    },
    {
      day: 'sat' as const,
      open: record.open_sat,
      close: record.close_sat,
      checked: record.checked_sat,
    },
    {
      day: 'sun' as const,
      open: record.open_sun,
      close: record.close_sun,
      checked: record.checked_sun,
    },
  ]

  for (const day of days) {
    if (day.checked === 1 && day.open && day.close) {
      hours.push({
        day: day.day,
        open: day.open,
        close: day.close,
      })
    }
  }

  return hours
}

async function findCategoryByName(payload: any, categoryName: string): Promise<string | null> {
  if (!categoryName || categoryName.trim() === '') {
    return null
  }

  try {
    // Strategy 1: Exact match by English name
    const exactMatch = await payload.find({
      collection: 'categories',
      where: {
        name: {
          equals: categoryName,
        },
      },
      limit: 1,
    })

    if (exactMatch.docs.length > 0) {
      return exactMatch.docs[0].id.toString()
    }

    // Strategy 2: Case-insensitive search
    const caseInsensitiveMatch = await payload.find({
      collection: 'categories',
      where: {
        name: {
          like: categoryName,
        },
      },
      limit: 1,
    })

    if (caseInsensitiveMatch.docs.length > 0) {
      return caseInsensitiveMatch.docs[0].id.toString()
    }

    // Strategy 3: Partial match
    const partialMatch = await payload.find({
      collection: 'categories',
      where: {
        name: {
          like: `%${categoryName}%`,
        },
      },
      limit: 1,
    })

    if (partialMatch.docs.length > 0) {
      return partialMatch.docs[0].id.toString()
    }

    return null
  } catch (error) {
    console.error(`Error finding category ${categoryName}:`, error)
    return null
  }
}

async function migrateDirectTable3() {
  const payload = await getPayload({ config })

  // Create a log file for records that don't get created
  const logFilePath = path.join(process.cwd(), 'migration-log.txt')
  const notCreatedRecords: Array<{
    id: number
    title_en: string
    title_th: string
    title_cn: string
    slug: string
    collectionType: string
    reason: string
    cid: number
    scid: number
    zone: string
    room_number: string
  }> = []

  try {
    console.log('🚀 Starting migration of direct-table-export-3.json...')

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'direct-table-export-3.json')

    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath)
      return
    }

    const rawData = fs.readFileSync(filePath, 'utf8')
    const records: DirectTableRecord3[] = JSON.parse(rawData)

    console.log(`📊 Found ${records.length} records to process`)

    // Create Media records from image URLs
    const mediaMap = new Map<string, string>()
    const allImageUrls = new Set<string>()

    // Collect all unique image URLs
    records.forEach((record) => {
      const imageFields = [
        record.shop_logo_url,
        record.image_thumbnail,
        record.shop_image_slide1,
        record.shop_image_slide2,
        record.shop_image_slide3,
        record.shop_image_slide4,
        record.shop_image_slide5,
        record.shop_image_slide6,
        record.shop_image_slide7,
        record.shop_image_slide8,
      ]

      imageFields.forEach((url) => {
        if (url && url.trim() && url.trim() !== '') {
          allImageUrls.add(url.trim())
        }
      })
    })

    console.log(`Found ${allImageUrls.size} unique image URLs`)

    // Create Media records
    for (const imageUrl of allImageUrls) {
      try {
        // Extract filename from URL and sanitize it
        const urlParts = imageUrl.split('/')
        let filename = urlParts[urlParts.length - 1] || 'image.jpg'

        // Remove query parameters if present
        filename = filename.split('?')[0] || 'image.jpg'

        // Sanitize filename - remove invalid characters and ensure valid extension
        filename = filename
          .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores

        // Ensure filename has a valid extension
        if (!filename.includes('.')) {
          filename = `${filename}.jpg`
        }

        // Ensure filename is not empty
        if (!filename || filename.trim() === '') {
          filename = `image-${Date.now()}.jpg`
        }

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
            continue
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
          }
        } else {
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
        }
      } catch (error) {
        console.error(`Error creating media for ${imageUrl}:`, error)
      }
    }

    // Process records
    let diningCreated = 0
    let diningUpdated = 0
    let shopCreated = 0
    let shopUpdated = 0

    for (const record of records) {
      try {
        console.log(
          `\n🔍 Processing record ID ${record.id}: "${record.title_en}" (slug: ${record.slug})`,
        )

        // Determine collection type based on cid
        const collectionType = cidToCollectionMap[record.cid] || 'shops'
        console.log(`📁 Collection type: ${collectionType} (cid: ${record.cid})`)

        // Get category name from scid mapping
        const categoryName = scidToCategoryMapping[record.scid] || 'GENERAL'
        console.log(`🎯 Target category: ${categoryName} (scid: ${record.scid})`)

        // Find category ID
        const categoryId = await findCategoryByName(payload, categoryName)
        if (!categoryId) {
          console.log(`⚠️ Category not found: ${categoryName}, will create without category`)
        } else {
          console.log(`✅ Found category: ${categoryName} (ID: ${categoryId})`)
        }

        console.log(`📍 Location: Zone ${record.zone}, Room ${record.room_number}`)
        console.log(
          `🖼️ Images: Logo=${!!record.shop_logo_url}, Thumbnail=${!!record.image_thumbnail}, Gallery=${[record.shop_image_slide1, record.shop_image_slide2, record.shop_image_slide3, record.shop_image_slide4, record.shop_image_slide5, record.shop_image_slide6, record.shop_image_slide7, record.shop_image_slide8].filter(Boolean).length} images`,
        )

        // Get image IDs
        const getImageId = (url: string) => {
          if (!url || !url.trim()) return null
          return parseInt(mediaMap.get(url.trim()) || '0') || null
        }

        const logoId = getImageId(record.shop_logo_url)
        const thumbnailId = getImageId(record.image_thumbnail)
        const slide1Id = getImageId(record.shop_image_slide1)
        const slide2Id = getImageId(record.shop_image_slide2)
        const slide3Id = getImageId(record.shop_image_slide3)
        const slide4Id = getImageId(record.shop_image_slide4)
        const slide5Id = getImageId(record.shop_image_slide5)
        const slide6Id = getImageId(record.shop_image_slide6)
        const slide7Id = getImageId(record.shop_image_slide7)
        const slide8Id = getImageId(record.shop_image_slide8)

        // Filter out null image IDs for gallery
        const galleryImages = [
          slide1Id,
          slide2Id,
          slide3Id,
          slide4Id,
          slide5Id,
          slide6Id,
          slide7Id,
          slide8Id,
        ]
          .filter((id) => id !== null)
          .map((id) => ({ image: id }))

        // Parse dates
        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr.trim() === '') return null
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
        }

        // Check if we have actual opening hours data
        const hasOpeningHours =
          record.open_mon ||
          record.close_mon ||
          record.open_tue ||
          record.close_tue ||
          record.open_wed ||
          record.close_wed ||
          record.open_thu ||
          record.close_thu ||
          record.open_fri ||
          record.close_fri ||
          record.open_sat ||
          record.close_sat ||
          record.open_sun ||
          record.close_sun

        // Create opening hours structure
        const openingHours = {
          same_hours_every_day: !hasOpeningHours, // If no specific hours, use same hours every day
          open: '10:00', // Default open time
          close: '22:00', // Default close time
          per_day: hasOpeningHours
            ? [
                {
                  day: 'mon' as const,
                  open: record.open_mon || '10:00',
                  close: record.close_mon || '22:00',
                },
                {
                  day: 'tue' as const,
                  open: record.open_tue || '10:00',
                  close: record.close_tue || '22:00',
                },
                {
                  day: 'wed' as const,
                  open: record.open_wed || '10:00',
                  close: record.close_wed || '22:00',
                },
                {
                  day: 'thu' as const,
                  open: record.open_thu || '10:00',
                  close: record.close_thu || '22:00',
                },
                {
                  day: 'fri' as const,
                  open: record.open_fri || '10:00',
                  close: record.close_fri || '22:00',
                },
                {
                  day: 'sat' as const,
                  open: record.open_sat || '10:00',
                  close: record.close_sat || '22:00',
                },
                {
                  day: 'sun' as const,
                  open: record.open_sun || '10:00',
                  close: record.close_sun || '22:00',
                },
              ]
            : [], // Empty array if no specific hours
        }

        // Create contact info
        const contactInfo = {
          website: record.shop_url || '',
          phone: record.tel || '',
          instagram_url: record.instagram_url || '',
          facebook_url: record.facebook_url || '',
          wechat_account: record.wechat_account || '',
          line_account: record.line_account || '',
          weibo_url: record.weibo_url || '',
        }

        // Create location coordinates
        const locationCoordinates = {
          poi_x: record.poi_x || 0,
          poi_y: record.poi_y || 0,
        }

        // Create images structure
        const images = {
          logo: logoId,
          main_image: thumbnailId,
          thumbnail: thumbnailId,
          facebook_image: null, // No facebook_image_url in this data
          gallery: galleryImages,
        }

        // Create keywords array
        const keywords = [record.seo_keyword_th, record.seo_keyword_en, record.seo_keyword_cn]
          .filter((keyword) => keyword && keyword.trim())
          .map((keyword) => ({ keyword }))

        // Create tags array
        const tags = record.tags
          ? record.tags
              .split(',')
              .map((tag) => ({ tag: tag.trim() }))
              .filter((item) => item.tag)
          : []

        // Create the base record data (English content)
        const baseData = {
          title: decodeText(record.title_en),
          subtitle: decodeText(record.sub_title_en),
          description: decodeText(record.description_en),
          categories: categoryId ? [parseInt(categoryId)] : [],
          location_zone: record.zone || '',
          location_shop_number: record.room_number || '',
          location_coordinates: locationCoordinates,
          opening_hours: openingHours,
          contact_info: contactInfo,
          images,
          status: record.active === 1 ? ('ACTIVE' as const) : ('INACTIVE' as const),
          date_range: {
            start_date: parseDate(record.start_date),
            end_date: parseDate(record.end_date),
          },
          meta: {
            title: decodeText(record.seo_desc_en),
            description: decodeText(record.seo_desc_en),
          },
          slug: record.slug,
          keywords,
          tags,
          related_content: [],
          related_promotions: [],
          short_alphabet: decodeText(record.short_alphabet || ''),
          is_featured: false,
          sort_order: record.sort || 0,
        }

        if (collectionType === 'dinings') {
          console.log(`🍽️ Processing as DINING record...`)

          // Check if dining record already exists by slug first (more reliable)
          const existingDiningBySlug = await payload.find({
            collection: 'dinings',
            where: {
              slug: {
                equals: record.slug,
              },
            },
            limit: 1,
          })

          if (existingDiningBySlug.docs.length > 0) {
            console.log(`🔄 Found existing dining by slug: ${record.slug}`)
            // Update existing dining record found by slug
            const existingId = existingDiningBySlug.docs[0]?.id
            if (!existingId) {
              console.error(
                `Error: Existing dining record found by slug but no ID available for: ${record.slug}`,
              )
              continue
            }

            await payload.update({
              collection: 'dinings',
              id: existingId,
              data: baseData,
              locale: 'en',
            })

            // Update with Thai content
            if (record.title_th) {
              await payload.update({
                collection: 'dinings',
                id: existingId,
                data: {
                  title: decodeText(record.title_th),
                  subtitle: decodeText(record.sub_title_th),
                  description: decodeText(record.description_th),
                  meta: {
                    title: decodeText(record.seo_desc_th),
                    description: decodeText(record.seo_desc_th),
                  },
                },
                locale: 'th',
              })
            }

            // Update with Chinese content
            if (record.title_cn) {
              await payload.update({
                collection: 'dinings',
                id: existingId,
                data: {
                  title: decodeText(record.title_cn),
                  subtitle: decodeText(record.sub_title_cn),
                  description: decodeText(record.description_cn),
                  meta: {
                    title: decodeText(record.seo_desc_cn),
                    description: decodeText(record.seo_desc_cn),
                  },
                },
                locale: 'zh',
              })
            }

            diningUpdated++
            console.log(
              `Updated existing dining by slug: ${record.title_en || record.title_th} (${record.slug})`,
            )

            // Log that this record was not created (it was updated instead)
            notCreatedRecords.push({
              id: record.id,
              title_en: record.title_en,
              title_th: record.title_th,
              title_cn: record.title_cn,
              slug: record.slug,
              collectionType: 'dinings',
              reason: 'Found existing by slug - Updated instead of created',
              cid: record.cid,
              scid: record.scid,
              zone: record.zone,
              room_number: record.room_number,
            })
          } else {
            console.log(`🔍 No existing dining found by slug, checking by title...`)
            // Check if dining record already exists by English title
            const existingDining = await payload.find({
              collection: 'dinings',
              where: {
                title: {
                  equals: decodeText(record.title_en),
                },
              },
              locale: 'en',
              limit: 1,
            })

            if (existingDining.docs.length > 0) {
              console.log(`🔄 Found existing dining by title: ${decodeText(record.title_en)}`)
              // Update existing dining record found by title
              const existingId = existingDining.docs[0]?.id
              if (!existingId) {
                console.error(
                  `Error: Existing dining record found by title but no ID available for: ${record.title_en}`,
                )
                continue
              }

              await payload.update({
                collection: 'dinings',
                id: existingId,
                data: baseData,
                locale: 'en',
              })

              // Update with Thai content
              if (record.title_th) {
                await payload.update({
                  collection: 'dinings',
                  id: existingId,
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                    },
                  },
                  locale: 'th',
                })
              }

              // Update with Chinese content
              if (record.title_cn) {
                await payload.update({
                  collection: 'dinings',
                  id: existingId,
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              diningUpdated++
              console.log(
                `Updated existing dining by title: ${record.title_en || record.title_th} (${record.slug})`,
              )

              // Log that this record was not created (it was updated instead)
              notCreatedRecords.push({
                id: record.id,
                title_en: record.title_en,
                title_th: record.title_th,
                title_cn: record.title_cn,
                slug: record.slug,
                collectionType: 'dinings',
                reason: 'Found existing by title - Updated instead of created',
                cid: record.cid,
                scid: record.scid,
                zone: record.zone,
                room_number: record.room_number,
              })
            } else {
              console.log(`✨ Creating NEW dining record...`)
              // Create new dining record with English locale
              await payload.create({
                collection: 'dinings',
                data: baseData,
                locale: 'en',
              })

              // Update with Thai content
              if (record.title_th) {
                await payload.update({
                  collection: 'dinings',
                  where: { slug: { equals: record.slug } },
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                    },
                  },
                  locale: 'th',
                })
              }

              // Update with Chinese content
              if (record.title_cn) {
                await payload.update({
                  collection: 'dinings',
                  where: { slug: { equals: record.slug } },
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              diningCreated++
              console.log(
                `Created new dining: ${record.title_en || record.title_th} (${record.slug})`,
              )
            }
          }
        } else {
          console.log(`🛍️ Processing as SHOP record...`)

          // Check if shop record already exists by slug first (more reliable)
          const existingShopBySlug = await payload.find({
            collection: 'shops',
            where: {
              slug: {
                equals: record.slug,
              },
            },
            limit: 1,
          })

          if (existingShopBySlug.docs.length > 0) {
            console.log(`🔄 Found existing shop by slug: ${record.slug}`)
            // Update existing shop record found by slug
            const existingId = existingShopBySlug.docs[0]?.id
            if (!existingId) {
              console.error(
                `Error: Existing shop record found by slug but no ID available for: ${record.slug}`,
              )
              continue
            }

            await payload.update({
              collection: 'shops',
              id: existingId,
              data: baseData,
              locale: 'en',
            })

            // Update with Thai content
            if (record.title_th) {
              await payload.update({
                collection: 'shops',
                id: existingId,
                data: {
                  title: decodeText(record.title_th),
                  subtitle: decodeText(record.sub_title_th),
                  description: decodeText(record.description_th),
                  meta: {
                    title: decodeText(record.seo_desc_th),
                    description: decodeText(record.seo_desc_th),
                  },
                },
                locale: 'th',
              })
            }

            // Update with Chinese content
            if (record.title_cn) {
              await payload.update({
                collection: 'shops',
                id: existingId,
                data: {
                  title: decodeText(record.title_cn),
                  subtitle: decodeText(record.sub_title_cn),
                  description: decodeText(record.description_cn),
                  meta: {
                    title: decodeText(record.seo_desc_cn),
                    description: decodeText(record.seo_desc_cn),
                  },
                },
                locale: 'zh',
              })
            }

            shopUpdated++
            console.log(
              `Updated existing shop by slug: ${record.title_en || record.title_th} (${record.slug})`,
            )

            // Log that this record was not created (it was updated instead)
            notCreatedRecords.push({
              id: record.id,
              title_en: record.title_en,
              title_th: record.title_th,
              title_cn: record.title_cn,
              slug: record.slug,
              collectionType: 'shops',
              reason: 'Found existing by slug - Updated instead of created',
              cid: record.cid,
              scid: record.scid,
              zone: record.zone,
              room_number: record.room_number,
            })
          } else {
            console.log(`🔍 No existing shop found by slug, checking by title...`)
            // Check if shop record already exists by English title
            const existingShop = await payload.find({
              collection: 'shops',
              where: {
                title: {
                  equals: decodeText(record.title_en),
                },
              },
              limit: 1,
            })

            if (existingShop.docs.length > 0) {
              console.log(`🔄 Found existing shop by title: ${decodeText(record.title_en)}`)
              // Update existing shop record found by title
              const existingId = existingShop.docs[0]?.id
              if (!existingId) {
                console.error(
                  `Error: Existing shop record found by title but no ID available for: ${record.title_en}`,
                )
                continue
              }

              await payload.update({
                collection: 'shops',
                id: existingId,
                data: baseData,
                locale: 'en',
              })

              // Update with Thai content
              if (record.title_th) {
                await payload.update({
                  collection: 'shops',
                  id: existingId,
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                    },
                  },
                  locale: 'th',
                })
              }

              // Update with Chinese content
              if (record.title_cn) {
                await payload.update({
                  collection: 'shops',
                  id: existingId,
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              shopUpdated++
              console.log(
                `Updated existing shop by title: ${record.title_en || record.title_th} (${record.slug})`,
              )

              // Log that this record was not created (it was updated instead)
              notCreatedRecords.push({
                id: record.id,
                title_en: record.title_en,
                title_th: record.title_th,
                title_cn: record.title_cn,
                slug: record.slug,
                collectionType: 'shops',
                reason: 'Found existing by title - Updated instead of created',
                cid: record.cid,
                scid: record.scid,
                zone: record.zone,
                room_number: record.room_number,
              })
            } else {
              console.log(`✨ Creating NEW shop record...`)
              // Create new shop record with English locale
              await payload.create({
                collection: 'shops',
                data: baseData,
                locale: 'en',
              })

              // Update with Thai content
              if (record.title_th) {
                await payload.update({
                  collection: 'shops',
                  where: { slug: { equals: record.slug } },
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                    },
                  },
                  locale: 'th',
                })
              }

              // Update with Chinese content
              if (record.title_cn) {
                await payload.update({
                  collection: 'shops',
                  where: { slug: { equals: record.slug } },
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              shopCreated++
              console.log(
                `Created new shop: ${record.title_en || record.title_th} (${record.slug})`,
              )
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing record ${record.id}:`, error)

        // Log the failed record
        notCreatedRecords.push({
          id: record.id,
          title_en: record.title_en,
          title_th: record.title_th,
          title_cn: record.title_cn,
          slug: record.slug,
          collectionType: cidToCollectionMap[record.cid] || 'shops',
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
          cid: record.cid,
          scid: record.scid,
          zone: record.zone,
          room_number: record.room_number,
        })
      }
    }

    console.log(`\nMigration completed!`)
    console.log(`- Created ${mediaMap.size} media records`)
    console.log(
      `- Dining records: ${diningCreated} created, ${diningUpdated} updated (${diningCreated + diningUpdated} total)`,
    )
    console.log(
      `- Shop records: ${shopCreated} created, ${shopUpdated} updated (${shopCreated + shopUpdated} total)`,
    )
    console.log(
      `- Total records processed: ${diningCreated + diningUpdated + shopCreated + shopUpdated}`,
    )

    // Write the log file for records that weren't created
    if (notCreatedRecords.length > 0) {
      const logContent =
        `Migration Log - Records Not Created\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `Total records not created: ${notCreatedRecords.length}\n\n` +
        notCreatedRecords
          .map(
            (record) =>
              `ID: ${record.id}\n` +
              `Title (EN): ${record.title_en}\n` +
              `Title (TH): ${record.title_th}\n` +
              `Title (CN): ${record.title_cn}\n` +
              `Slug: ${record.slug}\n` +
              `Collection: ${record.collectionType}\n` +
              `Reason: ${record.reason}\n` +
              `CID: ${record.cid}\n` +
              `SCID: ${record.scid}\n` +
              `Zone: ${record.zone}\n` +
              `Room: ${record.room_number}\n` +
              `---\n`,
          )
          .join('\n')

      fs.writeFileSync(logFilePath, logContent, 'utf8')
      console.log(`📝 Log file created: ${logFilePath}`)
      console.log(`📊 Records not created: ${notCreatedRecords.length}`)

      // Show summary of reasons
      const reasonCounts: { [key: string]: number } = {}
      notCreatedRecords.forEach((record) => {
        reasonCounts[record.reason] = (reasonCounts[record.reason] || 0) + 1
      })

      console.log('\n📋 Summary of reasons:')
      Object.entries(reasonCounts).forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count} records`)
      })
    } else {
      console.log(`✅ All records were processed successfully!`)
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

// Run the migration
migrateDirectTable3()
