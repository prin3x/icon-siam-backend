import { getPayload } from 'payload'
import config from '../payload.config'

// Map scid values to category names (from the original migration scripts)
const scidToCategoryMap: {
  [key: string]: { name: string; type: 'shops' | 'dinings' | 'promotions' | 'events' }
} = {
  // Shop categories
  fashion: { name: 'Fashion & Apparel', type: 'shops' },
  beauty: { name: 'Beauty & Wellness', type: 'shops' },
  living: { name: 'Home & Lifestyle', type: 'shops' },
  gadget: { name: 'Electronics & Gadgets', type: 'shops' },
  kids: { name: 'Kids & Toys', type: 'shops' },
  'club-&-lounge': { name: 'Club & Lounge', type: 'shops' },
  music: { name: 'Music & Entertainment', type: 'shops' },
  sports: { name: 'Sports & Fitness', type: 'shops' },
  health: { name: 'Health & Medical', type: 'shops' },
  auto: { name: 'Automotive', type: 'shops' },
  book: { name: 'Books & Education', type: 'shops' },

  // Dining categories
  restaurant: { name: 'Restaurants', type: 'dinings' },
  beverage: { name: 'Beverages', type: 'dinings' },
  dessert: { name: 'Desserts & Sweets', type: 'dinings' },
  cafes: { name: 'Cafes & Coffee Shops', type: 'dinings' },

  // Promotion categories (from promotions migration)
  'brand-promotion': { name: 'BRAND PROMOTION', type: 'promotions' },
  'tourist-privileges': { name: 'TOURIST PRIVILEGES', type: 'promotions' },
  'viz-card': { name: 'Viz Card', type: 'promotions' },
  'bank-credit-cards': { name: 'BANK & CREDIT CARDS', type: 'promotions' },
  storewide: { name: 'STOREWIDE', type: 'promotions' },

  // Event categories are created dynamically based on cid values
  // The events migration creates categories with original_id matching the cid

  // Special cases
  '': { name: 'General', type: 'shops' },
  null: { name: 'General', type: 'shops' },
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

async function findCategoryByEnglishName(
  payload: any,
  categoryName: string,
  type: 'shops' | 'dinings' | 'promotions' | 'events',
): Promise<string | null> {
  if (!categoryName || categoryName.trim() === '') {
    return null
  }

  try {
    // First, try to find by English name in the English locale
    const existingCategory = await payload.find({
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

    if (existingCategory.docs.length > 0) {
      return existingCategory.docs[0].id.toString()
    }

    // If not found, try without locale (fallback)
    const fallbackCategory = await payload.find({
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

    if (fallbackCategory.docs.length > 0) {
      return fallbackCategory.docs[0].id.toString()
    }

    console.warn(`⚠️ Category not found: ${categoryName} (${type})`)
    return null
  } catch (error) {
    console.error(`❌ Error finding category ${categoryName}:`, error)
    return null
  }
}

async function collectUnexpectedCategories(
  payload: any,
  unexpectedCategories: Set<string>,
): Promise<void> {
  console.log('\n--- Collecting Unexpected Categories ---')

  try {
    // Get all categories
    const allCategories = await payload.find({
      collection: 'categories',
      limit: 1000, // Adjust as needed
    })

    const expectedTypes = ['shops', 'dinings', 'promotions', 'events', 'directory']

    for (const category of allCategories.docs) {
      if (!expectedTypes.includes(category.type)) {
        unexpectedCategories.add(`${category.name} (ID: ${category.id}, Type: ${category.type})`)
      }
    }

    if (unexpectedCategories.size > 0) {
      console.log('⚠️ Found unexpected category types:')
      for (const category of unexpectedCategories) {
        console.log(`  - ${category}`)
      }
    } else {
      console.log('✅ All categories have expected types')
    }
  } catch (error) {
    console.error('❌ Error collecting unexpected categories:', error)
  }
}

async function collectOrphanedCategories(
  payload: any,
  orphanedCategories: Set<string>,
): Promise<void> {
  console.log('\n--- Collecting Orphaned Categories ---')

  try {
    // Get all categories
    const allCategories = await payload.find({
      collection: 'categories',
      limit: 1000, // Adjust as needed
    })

    for (const category of allCategories.docs) {
      let isUsed = false

      // Check if category is used in shops
      const shopsWithCategory = await payload.find({
        collection: 'shops',
        where: {
          categories: {
            in: [category.id],
          },
        },
        limit: 1,
      })

      if (shopsWithCategory.docs.length > 0) {
        isUsed = true
      }

      // Check if category is used in dinings
      const diningsWithCategory = await payload.find({
        collection: 'dinings',
        where: {
          categories: {
            in: [category.id],
          },
        },
        limit: 1,
      })

      if (diningsWithCategory.docs.length > 0) {
        isUsed = true
      }

      // Check if category is used in promotions
      const promotionsWithCategory = await payload.find({
        collection: 'promotions',
        where: {
          'relationships.categories': {
            in: [category.id],
          },
        },
        limit: 1,
      })

      if (promotionsWithCategory.docs.length > 0) {
        isUsed = true
      }

      // Check if category is used in events
      const eventsWithCategory = await payload.find({
        collection: 'events',
        where: {
          'relationships.categories': {
            in: [category.id],
          },
        },
        limit: 1,
      })

      if (eventsWithCategory.docs.length > 0) {
        isUsed = true
      }

      if (!isUsed) {
        orphanedCategories.add(`${category.name} (ID: ${category.id}, Type: ${category.type})`)
      }
    }

    if (orphanedCategories.size > 0) {
      console.log('⚠️ Found orphaned categories (not assigned to any records):')
      for (const category of orphanedCategories) {
        console.log(`  - ${category}`)
      }
    } else {
      console.log('✅ All categories are assigned to at least one record')
    }
  } catch (error) {
    console.error('❌ Error collecting orphaned categories:', error)
  }
}

async function fixCategoryRelationships() {
  const payload = await getPayload({ config })

  try {
    console.log('=== Starting Category Relationships Fix ===')

    let shopsUpdated = 0
    let diningsUpdated = 0
    let promotionsUpdated = 0
    let eventsUpdated = 0
    let shopsSkipped = 0
    let diningsSkipped = 0
    let promotionsSkipped = 0
    let eventsSkipped = 0

    // Collect unexpected categories
    const unexpectedCategories = new Set<string>()
    const orphanedCategories = new Set<string>()

    // Process Shops
    console.log('\n--- Processing Shops ---')
    const shops = await payload.find({
      collection: 'shops',
      limit: 1000, // Adjust as needed
    })

    for (const shop of shops.docs) {
      try {
        // For shops, we need to check if they already have categories assigned
        // If they do, we'll skip them as they're already properly categorized
        if (shop.categories && shop.categories.length > 0) {
          console.log(`⏭️ Skipping shop ${shop.title || shop.id}: Already has categories`)
          shopsSkipped++
          continue
        }

        // Since shops don't have system.cid/scid, we'll assign them to "General Shop" category
        const categoryName = 'General Shop'
        const categoryType: 'shops' | 'dinings' = 'shops'

        // Find the category by English name
        const categoryId = await findCategoryByEnglishName(payload, categoryName, categoryType)

        if (categoryId) {
          // Update shop with the correct category
          await payload.update({
            collection: 'shops',
            id: shop.id,
            data: {
              categories: [parseInt(categoryId)],
            },
          })

          shopsUpdated++
          console.log(`✅ Updated shop: ${shop.title || shop.id} -> ${categoryName}`)
        } else {
          console.log(
            `⚠️ Could not find category for shop: ${shop.title || shop.id} (${categoryName})`,
          )
          shopsSkipped++
        }
      } catch (error) {
        console.error(`❌ Error processing shop ${shop.id}:`, error)
        shopsSkipped++
      }
    }

    // Process Dinings
    console.log('\n--- Processing Dinings ---')
    const dinings = await payload.find({
      collection: 'dinings',
      limit: 1000, // Adjust as needed
    })

    for (const dining of dinings.docs) {
      try {
        // For dinings, we need to check if they already have categories assigned
        // If they do, we'll skip them as they're already properly categorized
        if (dining.categories && dining.categories.length > 0) {
          console.log(`⏭️ Skipping dining ${dining.title || dining.id}: Already has categories`)
          diningsSkipped++
          continue
        }

        // Since dinings don't have system.cid/scid, we'll assign them to "General Dining" category
        const categoryName = 'General Dining'
        const categoryType: 'shops' | 'dinings' = 'dinings'

        // Find the category by English name
        const categoryId = await findCategoryByEnglishName(payload, categoryName, categoryType)

        if (categoryId) {
          // Update dining with the correct category
          await payload.update({
            collection: 'dinings',
            id: dining.id,
            data: {
              categories: [parseInt(categoryId)],
            },
          })

          diningsUpdated++
          console.log(`✅ Updated dining: ${dining.title || dining.id} -> ${categoryName}`)
        } else {
          console.log(
            `⚠️ Could not find category for dining: ${dining.title || dining.id} (${categoryName})`,
          )
          diningsSkipped++
        }
      } catch (error) {
        console.error(`❌ Error processing dining ${dining.id}:`, error)
        diningsSkipped++
      }
    }

    // Process Promotions
    console.log('\n--- Processing Promotions ---')
    const promotions = await payload.find({
      collection: 'promotions',
      limit: 1000, // Adjust as needed
    })

    for (const promotion of promotions.docs) {
      try {
        // Check if promotion has system.cid
        const cid = promotion.system?.cid

        if (!cid) {
          console.log(`⏭️ Skipping promotion ${promotion.title || promotion.id}: No cid found`)
          promotionsSkipped++
          continue
        }

        // Determine category based on cid
        const categoryInfo = scidToCategoryMap[cid.toString()]
        if (!categoryInfo || categoryInfo.type !== 'promotions') {
          console.log(
            `⏭️ Skipping promotion ${promotion.title || promotion.id}: Unknown cid ${cid}`,
          )
          promotionsSkipped++
          continue
        }

        // Find the category by English name
        const categoryId = await findCategoryByEnglishName(payload, categoryInfo.name, 'promotions')

        if (categoryId) {
          // Update promotion with the correct category
          await payload.update({
            collection: 'promotions',
            id: promotion.id,
            data: {
              relationships: {
                categories: [parseInt(categoryId)],
              },
            },
          })

          promotionsUpdated++
          console.log(
            `✅ Updated promotion: ${promotion.title || promotion.id} -> ${categoryInfo.name}`,
          )
        } else {
          console.log(
            `⚠️ Could not find category for promotion: ${promotion.title || promotion.id} (${categoryInfo.name})`,
          )
          promotionsSkipped++
        }
      } catch (error) {
        console.error(`❌ Error processing promotion ${promotion.id}:`, error)
        promotionsSkipped++
      }
    }

    // Process Events
    console.log('\n--- Processing Events ---')
    const events = await payload.find({
      collection: 'events',
      limit: 1000, // Adjust as needed
    })

    for (const event of events.docs) {
      try {
        // Check if event has system.cid
        const cid = event.system?.cid

        if (!cid) {
          console.log(`⏭️ Skipping event ${event.title || event.id}: No cid found`)
          eventsSkipped++
          continue
        }

        // For events, find category by original_id (which matches the cid)
        try {
          const existingCategory = await payload.find({
            collection: 'categories',
            where: {
              and: [
                {
                  original_id: {
                    equals: cid.toString(),
                  },
                },
                {
                  type: {
                    equals: 'events',
                  },
                },
              ],
            },
            limit: 1,
          })

          if (existingCategory.docs.length > 0) {
            const categoryId = existingCategory.docs[0]?.id?.toString()

            if (categoryId) {
              // Update event with the correct category
              await payload.update({
                collection: 'events',
                id: event.id,
                data: {
                  relationships: {
                    categories: [parseInt(categoryId)],
                  },
                },
              })

              eventsUpdated++
              console.log(
                `✅ Updated event: ${event.title || event.id} -> Category ID ${categoryId}`,
              )
            } else {
              console.log(`⚠️ Could not get category ID for event: ${event.title || event.id}`)
              eventsSkipped++
            }
          } else {
            console.log(
              `⚠️ Could not find category with original_id ${cid} for event: ${event.title || event.id}`,
            )
            eventsSkipped++
          }
        } catch (error) {
          console.error(`❌ Error finding category for event ${event.id}:`, error)
          eventsSkipped++
        }
      } catch (error) {
        console.error(`❌ Error processing event ${event.id}:`, error)
        eventsSkipped++
      }
    }

    // Collect unexpected categories
    await collectUnexpectedCategories(payload, unexpectedCategories)

    // Collect orphaned categories
    await collectOrphanedCategories(payload, orphanedCategories)

    console.log('\n=== Category Relationships Fix Completed ===')
    console.log(`📊 Summary:`)
    console.log(`- Shops: ${shopsUpdated} updated, ${shopsSkipped} skipped`)
    console.log(`- Dinings: ${diningsUpdated} updated, ${diningsSkipped} skipped`)
    console.log(`- Promotions: ${promotionsUpdated} updated, ${promotionsSkipped} skipped`)
    console.log(`- Events: ${eventsUpdated} updated, ${eventsSkipped} skipped`)
    console.log(
      `- Total updated: ${shopsUpdated + diningsUpdated + promotionsUpdated + eventsUpdated}`,
    )
    console.log(
      `- Total skipped: ${shopsSkipped + diningsSkipped + promotionsSkipped + eventsSkipped}`,
    )
    console.log(`- Unexpected categories found: ${unexpectedCategories.size}`)
    console.log(`- Orphaned categories found: ${orphanedCategories.size}`)
  } catch (error) {
    console.error('❌ Category relationships fix failed:', error)
  } finally {
    process.exit(0)
  }
}

fixCategoryRelationships()
