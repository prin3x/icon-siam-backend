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

async function findPromotionByMultipleStrategies(
  payload: any,
  record: PromotionsTableRecord,
): Promise<any | null> {
  const titles = [
    { title: decodeText(record.title_en), locale: 'en' },
    { title: decodeText(record.title_th), locale: 'th' },
    { title: decodeText(record.title_cn), locale: 'cn' },
  ].filter((t) => t.title && t.title.trim() !== '')

  for (const { title, locale } of titles) {
    try {
      // Try to find by title in specific locale
      const result = await payload.find({
        collection: 'promotions',
        where: {
          title: {
            equals: title,
          },
        },
        locale,
        limit: 1,
      })

      if (result.docs.length > 0) {
        return { promotion: result.docs[0], foundBy: `${locale}: ${title}` }
      }

      // Try without locale
      const fallbackResult = await payload.find({
        collection: 'promotions',
        where: {
          title: {
            equals: title,
          },
        },
        limit: 1,
      })

      if (fallbackResult.docs.length > 0) {
        return { promotion: fallbackResult.docs[0], foundBy: `${locale}: ${title}` }
      }
    } catch (error) {
      console.warn(`Error searching for title "${title}" in ${locale}:`, error)
    }
  }

  return null
}

async function fixPromotionTitles() {
  const payload = await getPayload({ config })

  // Create a log file for promotions that couldn't be fixed
  const logFilePath = path.join(process.cwd(), 'promotion-titles-error-log.txt')
  const errorRecords: Array<{
    id: number
    title_en: string
    title_th: string
    title_cn: string
    slug: string
    reason: string
    foundByName?: string
  }> = []

  try {
    console.log('=== Starting Promotion Titles Fix ===')

    // Read the JSON data
    const dataPath = path.join(process.cwd(), 'data', 'promotions-table-export-2.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const records: PromotionsTableRecord[] = JSON.parse(rawData)

    console.log(`Found ${records.length} promotions to process`)

    let promotionsFixed = 0
    let promotionsSkipped = 0
    let promotionsNotFound = 0
    let promotionsError = 0

    for (const record of records) {
      try {
        console.log(
          `\n🔍 Processing promotion ID ${record.id}: "${record.title_en || record.title_th || record.title_cn || 'No title'}"`,
        )

        // Find the promotion in the database
        const found = await findPromotionByMultipleStrategies(payload, record)
        if (!found) {
          console.log(`❌ Promotion not found in database`)
          errorRecords.push({
            id: record.id,
            title_en: record.title_en,
            title_th: record.title_th,
            title_cn: record.title_cn,
            slug: record.slug || `promotion-${record.id}`,
            reason: 'Not found in database',
          })
          promotionsNotFound++
          continue
        }

        const { promotion, foundByName } = found
        console.log(`✅ Found promotion: ${foundByName}`)

        // Check if the promotion has valid titles
        const currentTitleEn = promotion.title?.en
        const currentTitleTh = promotion.title?.th
        const currentTitleCn = promotion.title?.cn

        // Check if all title fields are null or empty
        const hasValidTitle = [currentTitleEn, currentTitleTh, currentTitleCn].some(
          (title) => title && title.trim() !== '',
        )

        if (hasValidTitle) {
          console.log(`⏭️ Skipping promotion: Already has valid title`)
          promotionsSkipped++
          continue
        }

        console.log(`🔧 Fixing promotion with null/empty titles`)
        console.log(
          `  Current: EN="${currentTitleEn || 'NULL'}", TH="${currentTitleTh || 'NULL'}", CN="${currentTitleCn || 'NULL'}"`,
        )

        // Fix the titles by using the original data
        const titleEn = decodeText(record.title_en)
        const titleTh = decodeText(record.title_th)
        const titleCn = decodeText(record.title_cn)

        // Ensure at least one title is provided
        const fallbackTitle = titleEn || titleTh || titleCn || `Promotion ${record.id}`

        const updateData: any = {
          title: {},
        }

        // Only update if we have valid content
        if (titleEn && titleEn.trim() !== '') {
          updateData.title.en = titleEn
        }
        if (titleTh && titleTh.trim() !== '') {
          updateData.title.th = titleTh
        }
        if (titleCn && titleCn.trim() !== '') {
          updateData.title.cn = titleCn
        }

        // Ensure at least one locale has a title
        if (!updateData.title.en && !updateData.title.th && !updateData.title.cn) {
          updateData.title.en = fallbackTitle
        }

        // Update the promotion
        await payload.update({
          collection: 'promotions',
          id: promotion.id,
          data: updateData,
        })

        console.log(`✅ Fixed promotion titles: ${foundByName}`)
        promotionsFixed++
      } catch (error) {
        console.error(`❌ Error processing promotion ${record.id}:`, error)
        errorRecords.push({
          id: record.id,
          title_en: record.title_en,
          title_th: record.title_th,
          title_cn: record.title_cn,
          slug: record.slug || `promotion-${record.id}`,
          reason: `Error: ${error instanceof Error ? error.message : String(error)}`,
        })
        promotionsError++
      }
    }

    console.log('\n=== Promotion Titles Fix Completed ===')
    console.log('📊 Summary:')
    console.log(
      `- Promotions: ${promotionsFixed} fixed, ${promotionsSkipped} skipped, ${promotionsNotFound} not found, ${promotionsError} errors`,
    )
    console.log(`- Total fixed: ${promotionsFixed}`)
    console.log(`- Total skipped: ${promotionsSkipped}`)
    console.log(`- Total not found: ${promotionsNotFound}`)
    console.log(`- Total errors: ${promotionsError}`)

    // Write error log
    if (errorRecords.length > 0) {
      const logContent = [
        'Promotion Titles Error Log',
        `Generated: ${new Date().toISOString()}`,
        `Total records with issues: ${errorRecords.length}`,
        '',
        ...errorRecords.map((record) =>
          [
            `ID: ${record.id}`,
            `Title (EN): ${record.title_en}`,
            `Title (TH): ${record.title_th}`,
            `Title (CN): ${record.title_cn}`,
            `Slug: ${record.slug}`,
            `Reason: ${record.reason}`,
            record.foundByName ? `Found By: ${record.foundByName}` : '',
            '---',
          ]
            .filter(Boolean)
            .join('\n'),
        ),
      ].join('\n')

      fs.writeFileSync(logFilePath, logContent)
      console.log(`📝 Error log file created: ${logFilePath}`)
      console.log(`📊 Records with issues: ${errorRecords.length}`)

      // Summary of issues
      const issueSummary = errorRecords.reduce(
        (acc, record) => {
          const reason = record.reason
          acc[reason] = (acc[reason] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      console.log('\n📋 Summary of issues:')
      Object.entries(issueSummary).forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count} records`)
      })
    }
  } catch (error) {
    console.error('❌ Script failed:', error)
  } finally {
    process.exit(0)
  }
}

fixPromotionTitles()
