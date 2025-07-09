import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface DirectTableRecord {
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
  cid: string
  scid: string
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

// Map scid values to category names (updated to match actual database categories)
const scidToCategoryMap: { [key: string]: { name: string; type: 'shops' | 'dinings' } } = {
  // Shop categories
  fashion: { name: 'FASHION', type: 'shops' },
  beauty: { name: 'BEAUTY', type: 'shops' },
  living: { name: 'HOME & LIVING', type: 'shops' },
  gadget: { name: 'GADGET', type: 'shops' },
  kids: { name: 'Kids & Toys', type: 'shops' },
  'club-&-lounge': { name: 'CLUB & LOUNGE', type: 'shops' },
  music: { name: 'Music & Entertainment', type: 'shops' },
  sports: { name: 'HEALTH & SPORTS', type: 'shops' },
  health: { name: 'Health & Medical', type: 'shops' },
  auto: { name: 'Automotive', type: 'shops' },
  book: { name: 'Books & Education', type: 'shops' },

  // Dining categories
  restaurant: { name: 'Restaurants', type: 'dinings' },
  beverage: { name: 'DINING BEVERAGES', type: 'dinings' },
  dessert: { name: 'DESSERT', type: 'dinings' },
  cafes: { name: 'CAFE', type: 'dinings' },

  // Special cases
  '': { name: 'General Shop', type: 'shops' },
  null: { name: 'General Shop', type: 'shops' },
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

async function findCategoryByMultipleStrategies(
  payload: any,
  categoryName: string,
  type: 'shops' | 'dinings',
): Promise<string | null> {
  if (!categoryName || categoryName.trim() === '') {
    return null
  }

  try {
    // Strategy 1: Exact match by English name in English locale
    const exactMatch = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              equals: categoryName,
            },
          },
          {
            type: {
              equals: type,
            },
          },
        ],
      },
      locale: 'en',
      limit: 1,
    })

    if (exactMatch.docs.length > 0) {
      return exactMatch.docs[0].id.toString()
    }

    // Strategy 2: Exact match without locale
    const fallbackMatch = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              equals: categoryName,
            },
          },
          {
            type: {
              equals: type,
            },
          },
        ],
      },
      limit: 1,
    })

    if (fallbackMatch.docs.length > 0) {
      return fallbackMatch.docs[0].id.toString()
    }

    // Strategy 3: Case-insensitive search
    const caseInsensitiveMatch = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              like: categoryName,
            },
          },
          {
            type: {
              equals: type,
            },
          },
        ],
      },
      limit: 1,
    })

    if (caseInsensitiveMatch.docs.length > 0) {
      console.log(
        `🔍 Found category by case-insensitive match: ${caseInsensitiveMatch.docs[0].name} (${type})`,
      )
      return caseInsensitiveMatch.docs[0].id.toString()
    }

    // Strategy 4: Partial match search
    const partialMatch = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              like: categoryName.split(' ')[0], // Try first word
            },
          },
          {
            type: {
              equals: type,
            },
          },
        ],
      },
      limit: 1,
    })

    if (partialMatch.docs.length > 0) {
      console.log(`🔍 Found category by partial match: ${partialMatch.docs[0].name} (${type})`)
      return partialMatch.docs[0].id.toString()
    }

    // Strategy 5: Search all categories of this type and log them for debugging
    const allCategories = await payload.find({
      collection: 'categories',
      where: {
        type: {
          equals: type,
        },
      },
      limit: 50,
    })

    console.warn(`⚠️ Category not found: ${categoryName} (${type})`)
    console.log(
      `📋 Available ${type} categories: ${allCategories.docs.map((cat: any) => cat.name).join(', ')}`,
    )
    return null
  } catch (error) {
    console.error(`❌ Error finding category ${categoryName}:`, error)
    return null
  }
}

async function fixDirectCategories() {
  const payload = await getPayload({ config })

  try {
    console.log('=== Starting Direct Table Categories Fix ===')

    // Read the JSON data
    const dataPath = path.join(process.cwd(), 'data', 'direct-table-export-2.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const records: DirectTableRecord[] = JSON.parse(rawData)

    console.log(`Found ${records.length} records to process`)

    let shopsUpdated = 0
    let diningsUpdated = 0
    let shopsSkipped = 0
    let diningsSkipped = 0
    let shopsNotFound = 0
    let diningsNotFound = 0

    for (const record of records) {
      try {
        // Determine if this is a dining or shop based on cid
        const isDining = record.cid === 'dining'
        const collection = isDining ? 'dinings' : 'shops'

        // Find existing record by name priority: English -> Thai -> Chinese -> Slug
        let existingRecord = null
        let foundByName = ''

        // First try English name
        if (record.title_en && record.title_en.trim()) {
          const decodedTitleEn = decodeText(record.title_en)
          existingRecord = await payload.find({
            collection: collection,
            where: {
              title: {
                equals: decodedTitleEn,
              },
            },
            locale: 'en',
            limit: 1,
          })
          if (existingRecord.docs.length > 0) {
            foundByName = `English: ${decodedTitleEn}`
          }
        }

        // If not found by English, try Thai name
        if (!existingRecord || existingRecord.docs.length === 0) {
          if (record.title_th && record.title_th.trim()) {
            const decodedTitleTh = decodeText(record.title_th)
            existingRecord = await payload.find({
              collection: collection,
              where: {
                title: {
                  equals: decodedTitleTh,
                },
              },
              locale: 'th',
              limit: 1,
            })
            if (existingRecord.docs.length > 0) {
              foundByName = `Thai: ${decodedTitleTh}`
            }
          }
        }

        // If still not found, try Chinese name
        if (!existingRecord || existingRecord.docs.length === 0) {
          if (record.title_cn && record.title_cn.trim()) {
            const decodedTitleCn = decodeText(record.title_cn)
            existingRecord = await payload.find({
              collection: collection,
              where: {
                title: {
                  equals: decodedTitleCn,
                },
              },
              locale: 'zh',
              limit: 1,
            })
            if (existingRecord.docs.length > 0) {
              foundByName = `Chinese: ${decodedTitleCn}`
            }
          }
        }

        // If still not found, try by slug as fallback
        if (!existingRecord || existingRecord.docs.length === 0) {
          existingRecord = await payload.find({
            collection: collection,
            where: {
              slug: {
                equals: record.slug,
              },
            },
            limit: 1,
          })
          if (existingRecord.docs.length > 0) {
            foundByName = `Slug: ${record.slug}`
          }
        }

        if (!existingRecord || existingRecord.docs.length === 0) {
          console.log(
            `⏭️ Skipping ${collection.slice(0, -1)} ${record.title_en || record.title_th || record.title_cn || record.id}: Not found in database`,
          )
          if (isDining) {
            diningsNotFound++
          } else {
            shopsNotFound++
          }
          continue
        }

        const existingId = existingRecord.docs[0].id

        // Check current categories (but don't skip - we'll update them)
        const currentCategories = existingRecord.docs[0].categories || []
        if (currentCategories.length > 0) {
          console.log(
            `🔄 Updating ${collection.slice(0, -1)} ${record.title_en || record.title_th || record.id}: Already has ${currentCategories.length} categories, will update`,
          )
        }

        // Determine category based on cid and scid
        let categoryName = isDining ? 'General Dining' : 'General Shop'
        let categoryType: 'shops' | 'dinings' = isDining ? 'dinings' : 'shops'

        if (record.scid) {
          const decodedScid = decodeText(record.scid)
          const categoryInfo = scidToCategoryMap[decodedScid]
          if (categoryInfo && categoryInfo.type === categoryType) {
            categoryName = categoryInfo.name
          }
        }

        // Find the category using multiple strategies
        const categoryId = await findCategoryByMultipleStrategies(
          payload,
          categoryName,
          categoryType,
        )

        if (categoryId) {
          // Update record with the correct category
          await payload.update({
            collection: collection,
            id: existingId,
            data: {
              categories: [parseInt(categoryId)],
            },
          })

          if (isDining) {
            diningsUpdated++
            console.log(
              `✅ Updated dining: ${record.title_en || record.title_th || record.id} -> ${categoryName} (Found by: ${foundByName})`,
            )
          } else {
            shopsUpdated++
            console.log(
              `✅ Updated shop: ${record.title_en || record.title_th || record.id} -> ${categoryName} (Found by: ${foundByName})`,
            )
          }
        } else {
          console.log(
            `⚠️ Could not find category for ${collection.slice(0, -1)}: ${record.title_en || record.title_th || record.id} (${categoryName})`,
          )
          if (isDining) {
            diningsSkipped++
          } else {
            shopsSkipped++
          }
        }
      } catch (error) {
        console.error(`❌ Error processing record ${record.id}:`, error)
        if (record.cid === 'dining') {
          diningsSkipped++
        } else {
          shopsSkipped++
        }
      }
    }

    console.log('\n=== Direct Table Categories Fix Completed ===')
    console.log(`📊 Summary:`)
    console.log(
      `- Shops: ${shopsUpdated} updated, ${shopsSkipped} skipped, ${shopsNotFound} not found`,
    )
    console.log(
      `- Dinings: ${diningsUpdated} updated, ${diningsSkipped} skipped, ${diningsNotFound} not found`,
    )
    console.log(`- Total updated: ${shopsUpdated + diningsUpdated}`)
    console.log(`- Total skipped: ${shopsSkipped + diningsSkipped}`)
    console.log(`- Total not found: ${shopsNotFound + diningsNotFound}`)
  } catch (error) {
    console.error('❌ Direct table categories fix failed:', error)
  } finally {
    process.exit(0)
  }
}

fixDirectCategories()
