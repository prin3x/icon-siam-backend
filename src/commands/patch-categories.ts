import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface DirectTableRecord {
  id: number
  slug: string
  cid: string
  scid: string
  title_en: string
  title_th: string
  title_cn: string
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
  let decoded = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => htmlEntities[entity] || entity)
  // Decode numeric entities
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  // Decode unicode escapes
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

// Map scid values to category names
const scidToCategoryMap: { [key: string]: { name: string; type: 'shops' | 'dinings' } } = {
  // Shop categories
  fashion: { name: 'Fashion & Apparel', type: 'shops' },
  beauty: { name: 'Beauty & Wellness', type: 'shops' },
  living: { name: 'Home & Lifestyle', type: 'shops' },
  gadget: { name: 'Electronics & Gadgets', type: 'shops' },
  kids: { name: 'Kids & Toys', type: 'shops' },
  'club-&-lounge': { name: 'Club & Lounge', type: 'shops' },
  music: { name: 'Music & Entertainment', type: 'shops' },

  // Dining categories
  restaurant: { name: 'Restaurants', type: 'dinings' },
  beverage: { name: 'Beverages', type: 'dinings' },
  dessert: { name: 'Desserts & Sweets', type: 'dinings' },
  cafes: { name: 'Cafes & Coffee Shops', type: 'dinings' },

  // Special cases
  '': { name: 'General', type: 'shops' },
  null: { name: 'General', type: 'shops' },
}

async function findOrCreateCategory(
  payload: any,
  scid: string,
  cid: string,
): Promise<string | null> {
  if (!scid || scid.trim() === '') {
    // For empty scid, create a general category based on cid
    const categoryName = cid === 'dining' ? 'General Dining' : 'General Shop'
    const categoryType = cid === 'dining' ? 'dinings' : 'shops'

    try {
      // Check if category already exists
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
                equals: categoryType,
              },
            },
          ],
        },
        limit: 1,
      })

      if (existingCategory.docs.length > 0) {
        return existingCategory.docs[0].id.toString()
      }

      // Create new category
      const newCategory = await payload.create({
        collection: 'categories',
        data: {
          name: categoryName,
          slug: `${categoryType}-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          type: categoryType,
          status: 'ACTIVE',
          order: 999, // Put general categories at the end
        },
      })

      console.log(`✅ Created category: ${categoryName} (${categoryType})`)
      return newCategory.id.toString()
    } catch (error) {
      console.error(`❌ Error creating category ${categoryName}:`, error)
      return null
    }
  }

  const categoryInfo = scidToCategoryMap[scid]
  if (!categoryInfo) {
    console.warn(`⚠️ Unknown scid: ${scid} for cid: ${cid}`)
    return null
  }

  try {
    // Check if category already exists
    const existingCategory = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              equals: categoryInfo.name,
            },
          },
          {
            type: {
              equals: categoryInfo.type,
            },
          },
        ],
      },
      limit: 1,
    })

    if (existingCategory.docs.length > 0) {
      return existingCategory.docs[0].id.toString()
    }

    // Create new category
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        name: categoryInfo.name,
        slug: `${categoryInfo.type}-${categoryInfo.name.toLowerCase().replace(/\s+/g, '-')}`,
        type: categoryInfo.type,
        status: 'ACTIVE',
      },
    })

    console.log(`✅ Created category: ${categoryInfo.name} (${categoryInfo.type})`)
    return newCategory.id.toString()
  } catch (error) {
    console.error(`❌ Error creating category ${categoryInfo.name}:`, error)
    return null
  }
}

async function patchCategories() {
  const payload = await getPayload({ config })

  try {
    console.log('Starting category patch...')

    // Read the JSON data
    const dataPath = path.join(process.cwd(), 'data', 'direct-table-export.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const records: DirectTableRecord[] = JSON.parse(rawData)

    console.log(`Found ${records.length} records to process`)

    // Create a map of slug to scid for easy lookup
    const slugToScidMap = new Map<string, { scid: string; cid: string }>()

    records.forEach((record) => {
      slugToScidMap.set(record.slug, { scid: record.scid, cid: record.cid })
    })

    // Process dining records
    console.log('\nProcessing dining records...')
    const diningRecords = await payload.find({
      collection: 'dinings',
      limit: 1000, // Adjust as needed
    })

    let diningUpdated = 0
    for (const dining of diningRecords.docs) {
      try {
        const recordInfo = slugToScidMap.get(dining.slug || '')
        if (recordInfo) {
          const categoryId = await findOrCreateCategory(payload, recordInfo.scid, recordInfo.cid)

          if (categoryId && dining.id) {
            await payload.update({
              collection: 'dinings',
              id: dining.id,
              data: {
                categories: [parseInt(categoryId)],
              },
            })
            diningUpdated++
            const title = typeof dining.title === 'string' ? dining.title : 'Unknown'
            console.log(`✅ Updated dining: ${decodeText(title)} with category`)
          }
        } else {
          console.warn(`⚠️ No original data found for dining slug: ${dining.slug}`)
        }
      } catch (error) {
        console.error(`❌ Error updating dining ${dining.slug}:`, error)
      }
    }

    // Process shop records
    console.log('\nProcessing shop records...')
    const shopRecords = await payload.find({
      collection: 'shops',
      limit: 1000, // Adjust as needed
    })

    let shopUpdated = 0
    for (const shop of shopRecords.docs) {
      try {
        const recordInfo = slugToScidMap.get(shop.slug || '')
        if (recordInfo) {
          const categoryId = await findOrCreateCategory(payload, recordInfo.scid, recordInfo.cid)

          if (categoryId && shop.id) {
            await payload.update({
              collection: 'shops',
              id: shop.id,
              data: {
                categories: [parseInt(categoryId)],
              },
            })
            shopUpdated++
            const title = typeof shop.title === 'string' ? shop.title : 'Unknown'
            console.log(`✅ Updated shop: ${decodeText(title)} with category`)
          }
        } else {
          console.warn(`⚠️ No original data found for shop slug: ${shop.slug}`)
        }
      } catch (error) {
        console.error(`❌ Error updating shop ${shop.slug}:`, error)
      }
    }

    console.log(`\n🎉 Category patch completed!`)
    console.log(`- Updated ${diningUpdated} dining records`)
    console.log(`- Updated ${shopUpdated} shop records`)
    console.log(`- Total: ${diningUpdated + shopUpdated} records updated`)
  } catch (error) {
    console.error('Category patch failed:', error)
  } finally {
    process.exit(0)
  }
}

patchCategories()
