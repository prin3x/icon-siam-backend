import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface PromotionsTableRecord {
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
  cid: string
  scid: string
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
  pin_to_home: number
  pin_to_section: number
  sort: number
}

// Map cid values to category names (from promotions migration)
const cidToCategoryMap: { [key: string]: { name: string; type: 'promotions' } } = {
  'brand-promotion': { name: 'BRAND PROMOTION', type: 'promotions' },
  'tourist-privileges': { name: 'TOURIST PRIVILEGE', type: 'promotions' },
  'viz-card': { name: 'VIZ CARD', type: 'promotions' },
  'bank-credit-cards': { name: 'BANK & CREDIT CARDS', type: 'promotions' },
  storewide: { name: 'Store Wide', type: 'promotions' },
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
  type: 'promotions',
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

async function fixPromotionCategories() {
  const payload = await getPayload({ config })

  // Create a log file for promotions that couldn't be updated
  const logFilePath = path.join(process.cwd(), 'promotion-categories-error-log.txt')
  const errorRecords: Array<{
    id: number
    title_en: string
    title_th: string
    title_cn: string
    slug: string
    cid: string
    reason: string
    categoryName?: string
    foundByName?: string
    currentCategories?: number
  }> = []

  try {
    console.log('=== Starting Promotion Categories Fix ===')

    // Read the JSON data
    const dataPath = path.join(process.cwd(), 'data', 'promotions-table-export-2.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const records: PromotionsTableRecord[] = JSON.parse(rawData)

    console.log(`Found ${records.length} promotions to process`)

    let promotionsUpdated = 0
    let promotionsSkipped = 0
    let promotionsNotFound = 0

    for (const record of records) {
      try {
        console.log(
          `\n🔍 Processing promotion ID ${record.id}: "${record.title_en}" (cid: ${record.cid})`,
        )

        // Find existing promotion by multiple strategies: English -> Thai -> Chinese -> Slug
        let existingPromotion = null
        let foundByName = ''

        // First try English name
        if (record.title_en && record.title_en.trim()) {
          const decodedTitleEn = decodeText(record.title_en)
          console.log('decodedTitleEn', decodedTitleEn)
          existingPromotion = await payload.find({
            collection: 'promotions',
            where: {
              title: {
                equals: decodedTitleEn,
              },
            },
            locale: 'en',
            limit: 1,
          })
          if (existingPromotion.docs.length > 0) {
            foundByName = `English: ${decodedTitleEn}`
          }
        }

        // If not found by English, try Thai name
        if (!existingPromotion || existingPromotion.docs.length === 0) {
          if (record.title_th && record.title_th.trim()) {
            const decodedTitleTh = decodeText(record.title_th)
            existingPromotion = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  equals: decodedTitleTh,
                },
              },
              locale: 'th',
              limit: 1,
            })
            if (existingPromotion.docs.length > 0) {
              foundByName = `Thai: ${decodedTitleTh}`
            }
          }
        }

        // If still not found, try Chinese name
        if (!existingPromotion || existingPromotion.docs.length === 0) {
          if (record.title_cn && record.title_cn.trim()) {
            const decodedTitleCn = decodeText(record.title_cn)
            existingPromotion = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  equals: decodedTitleCn,
                },
              },
              locale: 'zh',
              limit: 1,
            })
            if (existingPromotion.docs.length > 0) {
              foundByName = `Chinese: ${decodedTitleCn}`
            }
          }
        }

        // If still not found, try by slug as fallback
        if (!existingPromotion || existingPromotion.docs.length === 0) {
          existingPromotion = await payload.find({
            collection: 'promotions',
            where: {
              slug: {
                equals: record.slug || `promotion-${record.id}`,
              },
            },
            limit: 1,
          })
          if (existingPromotion.docs.length > 0) {
            foundByName = `Slug: ${record.slug || `promotion-${record.id}`}`
          }
        }

        if (!existingPromotion || existingPromotion.docs.length === 0) {
          console.log(
            `⏭️ Skipping promotion ${record.title_en || record.title_th || record.title_cn || record.id}: Not found in database`,
          )

          // Log the not found record
          errorRecords.push({
            id: record.id,
            title_en: record.title_en,
            title_th: record.title_th,
            title_cn: record.title_cn,
            slug: record.slug || `promotion-${record.id}`,
            cid: record.cid,
            reason: 'Not found in database',
          })

          promotionsNotFound++
          continue
        }

        const existingId = existingPromotion.docs[0].id

        // Check if already has categories
        const currentCategories = existingPromotion.docs[0].relationships?.categories || []
        if (currentCategories.length > 0) {
          console.log(
            `⏭️ Skipping promotion ${record.title_en || record.title_th || record.title_cn || record.id}: Already has ${currentCategories.length} categories`,
          )

          promotionsSkipped++
          continue
        }

        // Determine category based on cid
        const categoryInfo = cidToCategoryMap[record.cid]
        if (!categoryInfo) {
          console.log(
            `⏭️ Skipping promotion ${record.title_en || record.title_th || record.title_cn || record.id}: Unknown cid ${record.cid}`,
          )

          // Log the record with unknown cid
          errorRecords.push({
            id: record.id,
            title_en: record.title_en,
            title_th: record.title_th,
            title_cn: record.title_cn,
            slug: record.slug || `promotion-${record.id}`,
            cid: record.cid,
            reason: 'Unknown cid',
            foundByName,
          })

          promotionsSkipped++
          continue
        }

        // Find the category using multiple strategies
        const categoryId = await findCategoryByMultipleStrategies(
          payload,
          categoryInfo.name,
          'promotions',
        )

        if (categoryId) {
          console.log('categoryId', categoryId)
          console.log('existingId', existingId)

          // Update promotion with the correct category
          await payload.update({
            collection: 'promotions',
            where: {
              id: {
                equals: existingId,
              },
            },
            data: {
              relationships: {
                categories: [parseInt(categoryId)],
              },
            },
          })

          promotionsUpdated++
          console.log(
            `✅ Updated promotion: ${record.title_en || record.title_th || record.title_cn || record.id} -> ${categoryInfo.name} (Found by: ${foundByName})`,
          )
        } else {
          console.log(
            `⚠️ Could not find category for promotion: ${record.title_en || record.title_th || record.title_cn || record.id} (${categoryInfo.name})`,
          )

          // Log the record where category was not found
          errorRecords.push({
            id: record.id,
            title_en: record.title_en,
            title_th: record.title_th,
            title_cn: record.title_cn,
            slug: record.slug || `promotion-${record.id}`,
            cid: record.cid,
            reason: 'Category not found',
            categoryName: categoryInfo.name,
            foundByName,
          })

          promotionsSkipped++
        }
      } catch (error) {
        console.error(`❌ Error processing promotion ${record.id}:`, error)

        // Log the error record
        errorRecords.push({
          id: record.id,
          title_en: record.title_en,
          title_th: record.title_th,
          title_cn: record.title_cn,
          slug: record.slug || `promotion-${record.id}`,
          cid: record.cid,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        })

        promotionsSkipped++
      }
    }

    console.log('\n=== Promotion Categories Fix Completed ===')
    console.log(`📊 Summary:`)
    console.log(
      `- Promotions: ${promotionsUpdated} updated, ${promotionsSkipped} skipped, ${promotionsNotFound} not found`,
    )
    console.log(`- Total updated: ${promotionsUpdated}`)
    console.log(`- Total skipped: ${promotionsSkipped}`)
    console.log(`- Total not found: ${promotionsNotFound}`)

    // Write the error log file
    if (errorRecords.length > 0) {
      const logContent =
        `Promotion Categories Error Log\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `Total records with issues: ${errorRecords.length}\n\n` +
        errorRecords
          .map(
            (record) =>
              `ID: ${record.id}\n` +
              `Title (EN): ${record.title_en}\n` +
              `Title (TH): ${record.title_th}\n` +
              `Title (CN): ${record.title_cn}\n` +
              `Slug: ${record.slug}\n` +
              `CID: ${record.cid}\n` +
              `Reason: ${record.reason}\n` +
              (record.categoryName ? `Category Name: ${record.categoryName}\n` : '') +
              (record.foundByName ? `Found By: ${record.foundByName}\n` : '') +
              (record.currentCategories
                ? `Current Categories: ${record.currentCategories}\n`
                : '') +
              `---\n`,
          )
          .join('\n')

      fs.writeFileSync(logFilePath, logContent, 'utf8')
      console.log(`📝 Error log file created: ${logFilePath}`)
      console.log(`📊 Records with issues: ${errorRecords.length}`)

      // Show summary of reasons
      const reasonCounts: { [key: string]: number } = {}
      errorRecords.forEach((record) => {
        reasonCounts[record.reason] = (reasonCounts[record.reason] || 0) + 1
      })

      console.log('\n📋 Summary of issues:')
      Object.entries(reasonCounts).forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count} records`)
      })
    } else {
      console.log(`✅ All promotions were processed successfully!`)
    }
  } catch (error) {
    console.error('❌ Promotion categories fix failed:', error)
  } finally {
    process.exit(0)
  }
}

fixPromotionCategories()
