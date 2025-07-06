import { getPayload } from 'payload'
import config from '../payload.config'

async function debugTitleValidation() {
  const payload = await getPayload({ config })

  try {
    console.log('🔍 Debugging Title Validation Issues...')

    // Get a few promotions that might have title issues
    const promotions = await payload.find({
      collection: 'promotions',
      limit: 10,
    })

    console.log(`\n📋 Examining ${promotions.docs.length} promotions:`)

    promotions.docs.forEach((promotion: any, index: number) => {
      console.log(`\n--- Promotion ${index + 1} (ID: ${promotion.id}) ---`)
      console.log(`Title EN: "${promotion.title?.en || 'NULL'}"`)
      console.log(`Title TH: "${promotion.title?.th || 'NULL'}"`)
      console.log(`Title CN: "${promotion.title?.cn || 'NULL'}"`)

      // Check if all titles are empty
      const titleEn = promotion.title?.en || ''
      const titleTh = promotion.title?.th || ''
      const titleCn = promotion.title?.cn || ''

      const allEmpty = [titleEn, titleTh, titleCn].every((title) => !title || title.trim() === '')
      console.log(`All titles empty: ${allEmpty}`)

      // Check for HTML entities
      const hasHtmlEntities = [titleEn, titleTh, titleCn].some(
        (title) =>
          title &&
          (title.includes('&amp;') || title.includes('&#039;') || title.includes('&quot;')),
      )
      console.log(`Has HTML entities: ${hasHtmlEntities}`)
    })

    // Try to find promotions with specific error patterns
    console.log(`\n🔍 Looking for promotions with potential title issues...`)

    // Check for promotions with null titles
    const nullTitlePromotions = await payload.find({
      collection: 'promotions',
      where: {
        or: [
          {
            'title.en': {
              exists: false,
            },
          },
          {
            'title.th': {
              exists: false,
            },
          },
          {
            'title.cn': {
              exists: false,
            },
          },
        ],
      },
      limit: 5,
    })

    console.log(`\n📋 Found ${nullTitlePromotions.docs.length} promotions with null titles:`)
    nullTitlePromotions.docs.forEach((promotion: any) => {
      console.log(`ID: ${promotion.id}`)
      console.log(`  EN: "${promotion.title?.en || 'NULL'}"`)
      console.log(`  TH: "${promotion.title?.th || 'NULL'}"`)
      console.log(`  CN: "${promotion.title?.cn || 'NULL'}"`)
    })
  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    process.exit(0)
  }
}

debugTitleValidation()
