import { readFileSync } from 'fs'
import { join } from 'path'

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

function validatePromotionData(
  promotion: any,
  index: number,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required fields
  if (!promotion.id || typeof promotion.id !== 'number') {
    errors.push('Missing or invalid id field')
  }

  if (!promotion.slug || typeof promotion.slug !== 'string') {
    errors.push('Missing or invalid slug field')
  }

  // Check locale fields
  const localeFields = [
    'title_th',
    'title_en',
    'title_cn',
    'sub_title_th',
    'sub_title_en',
    'sub_title_cn',
  ]
  for (const field of localeFields) {
    if (promotion[field] !== undefined && typeof promotion[field] !== 'string') {
      errors.push(`Invalid ${field} field type`)
    }
  }

  // Check date fields
  const dateFields = ['start_date', 'end_date', 'created_at', 'modified_at']
  for (const field of dateFields) {
    if (promotion[field] && isNaN(Date.parse(promotion[field]))) {
      errors.push(`Invalid date format for ${field}`)
    }
  }

  // Check numeric fields
  const numericFields = ['active', 'pin_to_home', 'pin_to_section', 'sort']
  for (const field of numericFields) {
    if (promotion[field] !== undefined && typeof promotion[field] !== 'number') {
      errors.push(`Invalid ${field} field type`)
    }
  }

  // Check image URLs
  const imageFields = ['image_thumbnail', 'cover_photo', 'facebook_image_url']
  for (const field of imageFields) {
    if (promotion[field] && typeof promotion[field] !== 'string') {
      errors.push(`Invalid ${field} field type`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

async function validatePromotionsData() {
  try {
    // Read the JSON file
    const jsonPath = join(process.cwd(), 'data', 'promotions-table-export-2.json')
    console.log(`Reading file: ${jsonPath}`)

    if (!require('fs').existsSync(jsonPath)) {
      console.error('❌ JSON file not found!')
      console.error(`Expected file: ${jsonPath}`)
      process.exit(1)
    }

    const jsonData = readFileSync(jsonPath, 'utf-8')
    console.log('✅ JSON file read successfully')

    // Parse JSON
    let legacyPromotions: any[]
    try {
      legacyPromotions = JSON.parse(jsonData)
      console.log('✅ JSON parsed successfully')
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error)
      process.exit(1)
    }

    // Validate array structure
    if (!Array.isArray(legacyPromotions)) {
      console.error('❌ JSON data is not an array')
      process.exit(1)
    }

    console.log(`📊 Found ${legacyPromotions.length} promotions to validate`)

    // Validate each promotion
    let validCount = 0
    let invalidCount = 0
    const allErrors: { index: number; errors: string[] }[] = []

    for (let i = 0; i < legacyPromotions.length; i++) {
      const promotion = legacyPromotions[i]
      const validation = validatePromotionData(promotion, i)

      if (validation.isValid) {
        validCount++
      } else {
        invalidCount++
        allErrors.push({ index: i, errors: validation.errors })
      }

      // Show progress every 100 records
      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${legacyPromotions.length} records validated`)
      }
    }

    // Summary
    console.log('\n📋 Validation Summary:')
    console.log(`✅ Valid records: ${validCount}`)
    console.log(`❌ Invalid records: ${invalidCount}`)
    console.log(`📊 Total records: ${legacyPromotions.length}`)

    if (invalidCount > 0) {
      console.log('\n🚨 Validation Errors:')
      allErrors.slice(0, 10).forEach(({ index, errors }) => {
        console.log(`Record ${index}:`)
        errors.forEach((error) => console.log(`  - ${error}`))
      })

      if (allErrors.length > 10) {
        console.log(`... and ${allErrors.length - 10} more errors`)
      }

      console.log(
        '\n⚠️  Some records have validation errors. Please fix them before running the patch script.',
      )
      process.exit(1)
    } else {
      console.log('\n🎉 All records are valid! You can now run the patch script.')
    }

    // Sample data preview
    if (legacyPromotions.length > 0) {
      console.log('\n📝 Sample Record Preview:')
      const sample = legacyPromotions[0]
      console.log(`ID: ${sample.id}`)
      console.log(`Slug: ${sample.slug}`)
      console.log(`Title (TH): ${sample.title_th?.substring(0, 50)}...`)
      console.log(`Title (EN): ${sample.title_en?.substring(0, 50)}...`)
      console.log(`Title (CN): ${sample.title_cn?.substring(0, 50)}...`)
      console.log(`Active: ${sample.active}`)
      console.log(`Start Date: ${sample.start_date}`)
      console.log(`End Date: ${sample.end_date}`)
    }
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

// Run validation
validatePromotionsData().catch(console.error)
