import { getPayload } from 'payload'
import config from '../src/payload.config'

async function patchPromotionCategories() {
  const payload = await getPayload({ config })

  try {
    console.log('🔍 Finding promotions with category 120...')

    // Use the actual category IDs from the database
    const category120Id = '120'
    const category299Id = '299'

    console.log(`📋 Using category 120 ID: ${category120Id}`)
    console.log(`📋 Using category 299 ID: ${category299Id}`)

    // Fetch the target category 299 to get its proper properties
    const targetCategory = await payload.findByID({
      collection: 'categories',
      id: category299Id,
    })

    if (!targetCategory) {
      console.log('❌ Category 299 not found')
      return
    }

    console.log(`📋 Target category: ${targetCategory.name} (${targetCategory.type})`)

    // Find all promotions that have category 120 in their relationships
    const promotionsWithCategory120 = await payload.find({
      collection: 'promotions',
      where: {
        'relationships.categories': {
          in: [category120Id],
        },
      },
      limit: 1000, // Adjust as needed
    })

    console.log(`📊 Found ${promotionsWithCategory120.docs.length} promotions with category 120`)

    let updated = 0
    let errors = 0

    for (const promotion of promotionsWithCategory120.docs) {
      try {
        const currentCategories = promotion.relationships?.categories || []

        // Check if this promotion actually has category 120
        const hasCategory120 = currentCategories.some((cat: any) => cat.id === 120)
        if (!hasCategory120) {
          continue
        }

        console.log(`   ✅ Found category 120, updating to category 299`)

        // Replace category 120 with category 299
        const updatedCategories = currentCategories.map((cat: any) =>
          cat.id === 120 ? targetCategory : cat,
        )

        // Update the promotion
        await payload.update({
          collection: 'promotions',
          id: promotion.id,
          data: {
            relationships: {
              ...promotion.relationships,
              categories: updatedCategories,
            },
          },
        })

        updated++
        console.log(`✅ Updated promotion: ${promotion.title || promotion.id}`)
      } catch (error) {
        errors++
        console.error(`❌ Error updating promotion ${promotion.id}:`, error)
      }
    }

    console.log(`\n📈 Category update complete:`)
    console.log(`- Updated promotions: ${updated}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('❌ Error in patchPromotionCategories:', error)
  } finally {
    process.exit(0)
  }
}

// Run the script
patchPromotionCategories().catch(console.error)
