import { getPayload } from 'payload'
import config from '../payload.config'
import { findFloor } from '../utilities/find-floor'

interface ExternalApiRecord {
  uniqueId: string
  tenantId: string
  sourceSystem: string
  type: string
  recordTypeName: string
  bandCode: string
  brandNameEn: string
  brandNameTh: string
  buildingName: string
  buildingCode: string
  shopNameEnglish: string
  shopNameThai: string
  status: boolean
  statusRevised: string
  categoryNameEn: string
  categoryNameTh: string
  subCategoryEn: string
  subCategoryTh: string
  zone: string
  floor: string
  floorRevised: string
  openingHours: string
  lastOrder: string
  unit: string
  tel: string
  contact: string
  website: string
  faqs: string
  descriptionEn: string
  descriptionTh: string
  attribute1: string
  attribute2: string
  attribute3Gender3: string
  attribute4Gender4: string
  attribute5ProductOffering1: string
  attribute6ProductOffering2: string
  attribute7ProductOffering3: string
  attribute8ProductOffering4: string
  attribute9ProductOffering5: string
  attribute10: string
  attribute11: string
  attribute12: string
  attribute13: string
  attribute14: string
  attribute15: string
  attribute16: string
  attribute17: string
  attribute18: string
  attribute19: string
  attribute20: string
  attribute21: string
  attribute22: string
  attribute23: string
  attribute24: string
  attribute25: string
  attribute26: string
  attribute27: string
  attribute28: string
  attribute29: string
  attribute30: string
  attribute31: string
  attribute32: string
  attribute33: string
  attribute34: string
  attribute35: string
  attribute36: string
  attribute37: string
  attribute38: string
  attribute39: string
  logo: string
  gallery_1: string
  gallery_2: string
  gallery_3: string
  gallery_4: string
  mapDirectory: string
  oneSiamTenantOnboard: string
  siamGiftCard: string
  changeRequest: string
  changeReason: string
  startDate: string
  endDate: string
  tenantLastUpdate: string
  mallLastUpdate: string | null
  listId: string
  action: string
  jobSyncDate: string
}

interface ExternalApiResponse {
  totalRecord: number
  page: number
  limit: number
  totalPages: number
  data: ExternalApiRecord[]
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

  let decoded = text
  const entityRegex = /&[a-zA-Z0-9#]+;/g
  let prev
  do {
    prev = decoded
    decoded = prev.replace(entityRegex, (entity) => htmlEntities[entity] || entity)
  } while (prev !== decoded)

  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

// Fetch data from external API
async function fetchExternalData(apiUrl: string, apiKey?: string): Promise<ExternalApiRecord[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (process.env.NODE_ENV === 'production') {
    headers['Cookie'] = process.env.EXTERNAL_API_COOKIES || ''
  }

  if (apiKey) {
    headers['X-Apig-AppCode'] = `${apiKey}`
  }

  const allRecords: ExternalApiRecord[] = []
  let currentPage = 1
  let totalPages = 1

  do {
    try {
      console.log(`Fetching page ${currentPage}...`)

      const response = await fetch(`${apiUrl}?page=${currentPage}&limit=100`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ExternalApiResponse = await response.json()

      allRecords.push(...data.data)
      totalPages = data.totalPages
      currentPage++

      console.log(`Fetched ${data.data.length} records from page ${currentPage - 1}`)

      // Add a small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error)
      break
    }
  } while (currentPage <= totalPages)

  console.log(`Total records fetched: ${allRecords.length}`)
  return allRecords
}

// Track unmapped floor names
const unmappedFloors = new Set<string>()

// Track unmapped category names
const unmappedCategories = new Set<string>()

// Find existing category only - do not create new categories
async function findCategory(
  payload: any,
  categoryNameEn: string,
  categoryNameTh: string,
  type: 'shops' | 'dinings',
): Promise<string | null> {
  if (!categoryNameEn && !categoryNameTh) return null

  const searchName = categoryNameEn || categoryNameTh

  // Common category mappings for better matching based on actual sample data
  const categoryMappings: { [key: string]: string } = {
    // International Luxury → Luxury (based on your requirement)
    'international luxury': 'LUXURY',
    'international luxury brands': 'LUXURY',
    'luxury international': 'LUXURY',
    'premium luxury': 'LUXURY',
    'high-end luxury': 'LUXURY',
    'luxury brands': 'LUXURY',
    'luxury fashion': 'LUXURY',

    // Fashion & Accessories → FASHION (from sample data)
    'fashion & accessories': 'FASHION',
    'fashion&accessories': 'FASHION',
    'fashion accessories': 'FASHION',
    'international fashion': 'FASHION',
    'premium fashion': 'FASHION',
    'high-end fashion': 'FASHION',
    'fashion brands': 'FASHION',

    // Health & Beauty → BEAUTY (from sample data)
    'health & beauty': 'BEAUTY',
    'health beauty': 'BEAUTY',
    'health&beauty': 'BEAUTY',
    'beauty & wellness': 'BEAUTY',
    'international beauty': 'BEAUTY',
    'premium beauty': 'BEAUTY',
    'beauty brands': 'BEAUTY',
    'international cosmetics': 'BEAUTY',
    'premium cosmetics': 'BEAUTY',

    // Mobile, Gadget, Electronics → GADGET (from sample data)
    'mobile, gadget, electronics': 'GADGET',
    'mobile gadget electronics': 'GADGET',
    'electronics & gadgets': 'GADGET',
    'gadget electronics': 'GADGET',
    'mobile electronics': 'GADGET',

    // Food & Beverage → DINING categories (from sample data)
    'food & beverage': 'RESTAURANT', // Default to restaurant for food
    'food beverage': 'RESTAURANT',
    'food and beverage': 'RESTAURANT',

    // Grocery, Lifestyle & Department Store → HOME & LIVING
    'grocery, lifestyle & department store': 'HOME & LIVING',
    'grocery lifestyle department store': 'HOME & LIVING',
    'lifestyle department store': 'HOME & LIVING',
    'grocery lifestyle': 'HOME & LIVING',

    // Leisure and Entertainment → CLUB & LOUNGE
    'leisure and entertainment': 'CLUB & LOUNGE',
    'leisure entertainment': 'CLUB & LOUNGE',
    'entertainment leisure': 'CLUB & LOUNGE',

    // Service → GENERAL (default for services)
    service: 'GENERAL',
    services: 'GENERAL',

    // Specialty → GENERAL (default for specialty items)
    specialty: 'GENERAL',
    'specialty items': 'GENERAL',

    // Additional mappings for common variations
    'international accessories': 'FASHION',
    'premium accessories': 'FASHION',
    'luxury accessories': 'LUXURY',
    'international jewelry': 'LUXURY',
    'premium jewelry': 'LUXURY',
    'luxury jewelry': 'LUXURY',
    'international watches': 'LUXURY',
    'premium watches': 'LUXURY',
    'luxury watches': 'LUXURY',
    'international footwear': 'FASHION',
    'premium footwear': 'FASHION',
    'luxury footwear': 'LUXURY',
    'international bags': 'FASHION',
    'premium bags': 'FASHION',
    'luxury bags': 'LUXURY',
    'international handbags': 'FASHION',
    'premium handbags': 'FASHION',
    'luxury handbags': 'LUXURY',
  }

  try {
    // Strategy 1: Try exact match first
    let existingCategory = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              equals: searchName,
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

    if (existingCategory.docs.length > 0) {
      console.log(`✅ Found existing category (exact match): ${searchName} (${type})`)
      return existingCategory.docs[0].id.toString()
    }

    // Strategy 2: Try category mappings
    const normalizedSearchName = searchName.toLowerCase().trim()
    const mappedCategory = categoryMappings[normalizedSearchName]

    if (mappedCategory) {
      existingCategory = await payload.find({
        collection: 'categories',
        where: {
          and: [
            {
              name: {
                equals: mappedCategory,
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

      if (existingCategory.docs.length > 0) {
        console.log(
          `✅ Found existing category (mapped): ${searchName} → ${mappedCategory} (${type})`,
        )
        return existingCategory.docs[0].id.toString()
      }
    }

    // Strategy 3: Try partial match (current behavior)
    existingCategory = await payload.find({
      collection: 'categories',
      where: {
        and: [
          {
            name: {
              like: `%${searchName}%`,
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

    if (existingCategory.docs.length > 0) {
      console.log(`✅ Found existing category (partial match): ${searchName} (${type})`)
      return existingCategory.docs[0].id.toString()
    }

    // Strategy 4: Try word-based matching (split by spaces and try each word)
    const words = searchName
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)

    for (const word of words) {
      existingCategory = await payload.find({
        collection: 'categories',
        where: {
          and: [
            {
              name: {
                like: `%${word}%`,
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

      if (existingCategory.docs.length > 0) {
        console.log(
          `✅ Found existing category (word match): ${searchName} → ${existingCategory.docs[0].name} (${type})`,
        )
        return existingCategory.docs[0].id.toString()
      }
    }

    // Strategy 5: Try reverse mapping (check if any mapped category contains our search term)
    for (const [mappedKey, mappedValue] of Object.entries(categoryMappings)) {
      if (mappedKey.includes(normalizedSearchName) || normalizedSearchName.includes(mappedKey)) {
        existingCategory = await payload.find({
          collection: 'categories',
          where: {
            and: [
              {
                name: {
                  equals: mappedValue,
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

        if (existingCategory.docs.length > 0) {
          console.log(
            `✅ Found existing category (reverse mapping): ${searchName} → ${mappedValue} (${type})`,
          )
          return existingCategory.docs[0].id.toString()
        }
      }
    }

    // No match found - track unmapped category names
    const categoryInfo = {
      name: searchName,
      type: type,
      englishName: categoryNameEn,
      thaiName: categoryNameTh,
    }
    unmappedCategories.add(JSON.stringify(categoryInfo))
    console.log(
      `⚠️  Category "${searchName}" (${type}) does not exist - skipping category assignment`,
    )
    return null
  } catch (error) {
    console.error(`❌ Error finding category ${searchName}:`, error)
    return null
  }
}

// Parse opening hours
function parseOpeningHours(openingHours: string): any {
  if (!openingHours || openingHours.trim() === '') {
    return {
      same_hours_every_day: true,
      open: '',
      close: '',
      per_day: [],
    }
  }

  // Parse format like "10.00 - 22.00" with non-backtracking regex
  const timeMatch = openingHours.match(/^(\d{1,2}\.\d{2})\s*-\s*(\d{1,2}\.\d{2})$/)
  if (timeMatch && timeMatch[1] && timeMatch[2]) {
    const openTime = timeMatch[1].replace('.', ':')
    const closeTime = timeMatch[2].replace('.', ':')

    return {
      same_hours_every_day: true,
      open: openTime,
      close: closeTime,
      per_day: [],
    }
  }

  // If no match, just store the raw string
  return {
    same_hours_every_day: true,
    open: openingHours,
    close: '',
    per_day: [],
  }
}

// Determine if record is dining or shop
function determineRecordType(record: ExternalApiRecord): 'dinings' | 'shops' {
  const categoryName = record.categoryNameEn?.toLowerCase() || ''

  // Food & Beverage categories are typically dining
  if (
    categoryName.includes('food') ||
    categoryName.includes('beverage') ||
    categoryName.includes('restaurant') ||
    categoryName.includes('cafe') ||
    categoryName.includes('bar') ||
    categoryName.includes('take home')
  ) {
    return 'dinings'
  }

  return 'shops'
}

// Utility to generate safe slug
function generateSafeSlug(brandName: string, tenantId: string): string {
  if (!brandName || !tenantId) return ''

  return (
    brandName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') + // Remove leading/trailing hyphens
    `-${tenantId}`
  )
}

// Utility to merge data while preserving existing non-empty values
function mergeDataPreservingExisting(existingData: any, newData: any): any {
  const merged = { ...existingData }

  for (const [key, newValue] of Object.entries(newData)) {
    // Skip null, undefined, empty strings, and empty objects
    if (newValue === null || newValue === undefined || newValue === '') {
      continue
    }

    // Skip empty objects
    if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
      if (Object.keys(newValue).length === 0) {
        continue
      }
    }

    // Skip empty arrays
    if (Array.isArray(newValue) && newValue.length === 0) {
      continue
    }

    // Special handling for media fields - preserve existing media
    if (key === 'images' && existingData.images) {
      // Only update media fields if new data has actual values
      const updatedImages = { ...existingData.images }
      for (const [mediaKey, mediaValue] of Object.entries(newValue)) {
        if (mediaValue !== null && mediaValue !== undefined && mediaValue !== '') {
          updatedImages[mediaKey] = mediaValue
        }
      }
      merged[key] = updatedImages
      continue
    }

    // Special handling for status - preserve existing status unless explicitly updating
    if (key === 'status' && existingData.status) {
      // Only update status if new status is explicitly provided and different
      if (newValue && newValue !== existingData.status) {
        merged[key] = newValue
      }
      continue
    }

    // Special handling for slug - preserve existing slug
    if (key === 'slug' && existingData.slug) {
      // Never update existing slug to preserve URLs and SEO
      continue
    }

    // Special handling for unique_id - always update if new unique_id is provided
    if (key === 'unique_id' && newValue) {
      // Always update unique_id if we have a valid unique_id from external API
      merged[key] = newValue
      continue
    }

    // Special handling for categories - add new categories to existing ones
    if (key === 'categories' && newValue && Array.isArray(newValue) && newValue.length > 0) {
      const existingCategories = merged[key] || []
      const existingCategoryIds = existingCategories.map((cat: any) =>
        typeof cat === 'object' ? cat.id : cat,
      )

      const newCategoryIds = newValue.map((cat: any) => (typeof cat === 'object' ? cat.id : cat))

      // Add new categories that don't already exist
      const uniqueNewCategories = newCategoryIds.filter((id) => !existingCategoryIds.includes(id))

      if (uniqueNewCategories.length > 0) {
        merged[key] = [...existingCategories, ...uniqueNewCategories]
      }
      continue
    }

    if (typeof newValue === 'object' && newValue !== null && !Array.isArray(newValue)) {
      // Handle nested objects
      if (!merged[key] || typeof merged[key] !== 'object') {
        merged[key] = {}
      }
      merged[key] = mergeDataPreservingExisting(merged[key], newValue)
    } else if (Array.isArray(newValue)) {
      // Handle arrays - only replace if new array is not empty
      if (newValue.length > 0) {
        merged[key] = newValue
      }
    } else {
      // Handle primitive values
      merged[key] = newValue
    }
  }

  return merged
}

// Sync a single record
async function syncRecord(payload: any, record: ExternalApiRecord) {
  try {
    const recordType = determineRecordType(record)
    const collection = recordType === 'dinings' ? 'dinings' : 'shops'

    console.log(`Processing ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`)

    // Validate required fields
    const validationIssues = []

    if (!record.uniqueId) {
      validationIssues.push('Missing unique ID')
    }

    if (
      !record.brandNameEn &&
      !record.shopNameEnglish &&
      !record.brandNameTh &&
      !record.shopNameThai
    ) {
      validationIssues.push('No name found in any language')
    }

    if (!record.tenantId) {
      validationIssues.push('Missing tenant ID')
    }

    // Find existing floor - try floorRevised first, then fall back to floor
    const floor = await findFloor(payload, record.floorRevised || record.floor, unmappedFloors)

    const floorId = floor?.id?.toString()

    // Find existing category only - do not create new categories
    const categoryId = await findCategory(
      payload,
      record.categoryNameEn,
      record.categoryNameTh,
      recordType,
    )

    // Parse dates
    const parseDate = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '') return null
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
    }

    // Create base data with only non-empty values (not null, undefined, or empty strings)
    const baseData: any = {}

    // Only add fields that have actual values (not null, undefined, or empty strings)
    if (record.brandNameEn || record.shopNameEnglish) {
      baseData.title = decodeText(record.brandNameEn || record.shopNameEnglish)
    }

    if (record.shopNameThai) {
      baseData.subtitle = decodeText(record.shopNameThai)
    }

    if (record.descriptionEn) {
      baseData.description = decodeText(record.descriptionEn)
    }

    if (floorId) {
      baseData.floor = parseInt(floorId)
    }

    if (record.zone) {
      baseData.location_zone = record.zone
    }

    if (record.unit) {
      baseData.location_shop_number = record.unit
    }

    if (record.openingHours) {
      baseData.opening_hours = parseOpeningHours(record.openingHours)
    }

    // Handle contact_info - only add fields that have values
    const contactInfo: any = {}
    if (record.website) contactInfo.website = record.website
    if (record.tel) contactInfo.phone = record.tel

    if (Object.keys(contactInfo).length > 0) {
      baseData.contact_info = contactInfo
    }

    // Handle date_range - only add if dates exist
    const startDate = parseDate(record.startDate)
    const endDate = parseDate(record.endDate)
    if (startDate || endDate) {
      baseData.date_range = {}
      if (startDate) baseData.date_range.start_date = startDate
      if (endDate) baseData.date_range.end_date = endDate
    }

    // Handle meta - only add if title or description exist
    const meta: any = {}
    if (record.brandNameEn) meta.title = decodeText(record.brandNameEn)
    if (record.descriptionEn) meta.description = decodeText(record.descriptionEn)

    if (Object.keys(meta).length > 0) {
      baseData.meta = meta
    }

    // Only add category if found - don't set to null
    if (categoryId) {
      baseData.categories = [parseInt(categoryId)]
      console.log(`   📂 Category assigned: ${record.categoryNameEn} → Category ID: ${categoryId}`)
    } else {
      console.log(`   ⚠️  No category found for: ${record.categoryNameEn}`)
    }

    // Always add unique_id from external API
    if (record.uniqueId) {
      baseData.unique_id = record.uniqueId
      console.log(`   🆔 Unique ID assigned: ${record.uniqueId}`)
    }

    // Note: Slug will be generated only for new records, existing records keep their current slug

    // Check if record already exists - try multiple search strategies
    let existingRecordData = null

    // Strategy 1: Search by unique_id
    if (record.uniqueId) {
      const uniqueIdSearch = await payload.find({
        collection,
        where: {
          unique_id: {
            equals: record.uniqueId,
          },
        },
        limit: 1,
      })

      if (uniqueIdSearch.docs.length > 0) {
        existingRecordData = uniqueIdSearch.docs[0]
        console.log(`Found existing record by unique_id: ${record.uniqueId}`)
      } else {
        console.log(`No existing record found by unique_id: ${record.uniqueId}`)
      }
    }

    if (existingRecordData) {
      // Update existing record - merge with existing data
      const existingId = existingRecordData.id
      const existingData = existingRecordData

      console.log(
        `🔄 Updating existing ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`,
      )
      console.log(`   Fields to update: ${Object.keys(baseData).join(', ')}`)
      console.log(`   Preserving existing slug: ${existingData.slug}`)

      // Log category update if applicable
      if (baseData.categories && existingData.categories) {
        console.log(
          `   📂 Updating categories: ${existingData.categories.map((c: any) => c.name).join(', ')} → ${baseData.categories.map((c: any) => c.name).join(', ')}`,
        )
      } else if (baseData.categories) {
        console.log(
          `   📂 Adding categories: ${baseData.categories.map((c: any) => c.name).join(', ')}`,
        )
      }

      // Log unique_id update if applicable
      if (baseData.unique_id && existingData.unique_id) {
        console.log(
          `   🆔 Updating unique_id: "${existingData.unique_id}" → "${baseData.unique_id}"`,
        )
      } else if (baseData.unique_id && !existingData.unique_id) {
        console.log(`   🆔 Adding unique_id: "${baseData.unique_id}"`)
      } else if (baseData.unique_id) {
        console.log(`   🆔 Setting unique_id: "${baseData.unique_id}"`)
      }

      // Merge new data with existing data, preserving existing non-empty values
      const mergedData = mergeDataPreservingExisting(existingData, baseData)

      try {
        // Update English version
        await payload.update({
          collection,
          where: { id: { equals: existingId } },
          data: mergedData,
          locale: 'en',
        })

        // Update Thai version - only if Thai data exists
        const thaiData: any = {}
        if (record.brandNameTh || record.shopNameThai) {
          thaiData.title = decodeText(record.brandNameTh || record.shopNameThai)
        }
        if (record.shopNameThai) {
          thaiData.subtitle = decodeText(record.shopNameThai)
        }
        if (record.descriptionTh) {
          thaiData.description = decodeText(record.descriptionTh)
        }

        // Handle Thai meta
        const thaiMeta: any = {}
        if (record.brandNameTh) thaiMeta.title = decodeText(record.brandNameTh)
        if (record.descriptionTh) thaiMeta.description = decodeText(record.descriptionTh)

        if (Object.keys(thaiMeta).length > 0) {
          thaiData.meta = thaiMeta
        }

        if (Object.keys(thaiData).length > 0) {
          // Get existing Thai data and merge
          const existingThaiData = await payload.findByID({
            collection,
            id: existingId,
            locale: 'th',
          })

          const mergedThaiData = mergeDataPreservingExisting(existingThaiData, thaiData)

          await payload.update({
            collection,
            id: existingId,
            data: mergedThaiData,
            locale: 'th',
          })
        }

        console.log(`✅ Updated ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`)
      } catch (updateError) {
        throw updateError
      }
    } else {
      // Create new record with default values for required fields

      // Generate slug for new record
      const newSlug =
        record.brandNameEn || record.shopNameEnglish
          ? generateSafeSlug(record.brandNameEn || record.shopNameEnglish, record.tenantId)
          : `shop-${record.tenantId}`

      const createData = {
        ...baseData,
        slug: newSlug, // Add slug for new record
        status: 'INACTIVE', // New records are always created as INACTIVE
        // Add default values for required fields that might be missing
        location_coordinates: {
          poi_x: 0,
          poi_y: 0,
        },
        images: {
          logo: null,
          main_image: null,
          thumbnail: null,
          facebook_image: null,
          gallery: [],
        },
        keywords: [],
        tags: [],
        related_content: [],
        related_promotions: [],
        short_alphabet: '',
        is_featured: false,
        sort_order: 0,
        // Categories are handled in baseData - only added if found
      }

      try {
        await payload.create({
          collection,
          data: createData,
          locale: 'en',
        })

        console.log(`✅ Created ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`)
        console.log(`   Created new slug: ${newSlug}`)
        console.log(`   Status set to: INACTIVE`)

        // Create Thai version with only Thai data
        const thaiData: any = {}
        if (record.brandNameTh || record.shopNameThai) {
          thaiData.title = decodeText(record.brandNameTh || record.shopNameThai)
        }
        if (record.shopNameThai) {
          thaiData.subtitle = decodeText(record.shopNameThai)
        }
        if (record.descriptionTh) {
          thaiData.description = decodeText(record.descriptionTh)
        }

        const thaiMeta: any = {}
        if (record.brandNameTh) thaiMeta.title = decodeText(record.brandNameTh)
        if (record.descriptionTh) thaiMeta.description = decodeText(record.descriptionTh)

        if (Object.keys(thaiMeta).length > 0) {
          thaiData.meta = thaiMeta
        }

        if (Object.keys(thaiData).length > 0) {
          await payload.update({
            collection,
            where: { slug: { equals: newSlug } },
            data: thaiData,
            locale: 'th',
          })
        }

        // Create Chinese version with English fallback
        const zhData: any = {}
        if (record.brandNameEn || record.brandNameTh) {
          zhData.title = decodeText(record.brandNameEn || record.brandNameTh)
        }
        if (record.shopNameEnglish) {
          zhData.subtitle = decodeText(record.shopNameEnglish)
        }
        if (record.descriptionEn) {
          zhData.description = decodeText(record.descriptionEn)
        }

        const zhMeta: any = {}
        if (record.brandNameEn) zhMeta.title = decodeText(record.brandNameEn)
        if (record.descriptionEn) zhMeta.description = decodeText(record.descriptionEn)

        if (Object.keys(zhMeta).length > 0) {
          zhData.meta = zhMeta
        }

        if (Object.keys(zhData).length > 0) {
          await payload.update({
            collection,
            where: { slug: { equals: newSlug } },
            data: zhData,
            locale: 'zh',
          })
        }

        console.log(`✅ Created ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`)
        console.log(`   Created new slug: ${newSlug}`)
        console.log(`   Status set to: INACTIVE`)
      } catch (createError) {
        throw createError
      }
    }

    // Return validation issues for summary
    return { validationIssues }
  } catch (error) {
    console.error(`❌ Error syncing record ${record.uniqueId}:`, error)
    throw error
  }
}

// Utility to get mapped floor id and code
async function getMappedFloor(payload: any, floorName: string) {
  const floor = await findFloor(payload, floorName, unmappedFloors)
  return floor
    ? { id: floor.id, code: (floor as any).code || floor.name || floor.id, name: floor.name }
    : null
}

// Main sync function
async function syncExternalApi() {
  const payload = await getPayload({ config })

  try {
    console.log('=== Starting External API Sync ===')

    // Configuration - you can move these to environment variables
    const API_URL =
      process.env.EXTERNAL_API_URL ||
      'https://qa-api-internal.onesiam.com/spwdirectoryservice/v1/Directories/Icon/TenantMalls'
    const API_KEY = process.env.X_APIG_APPCODE

    if (!API_URL) {
      throw new Error('EXTERNAL_API_URL environment variable is required')
    }

    // Fetch data from external API
    const records = await fetchExternalData(API_URL, API_KEY)

    if (records.length === 0) {
      console.log('No records found from external API')
      return
    }

    console.log(`📊 Processing ${records.length} records in batches...`)

    let successCount = 0
    let errorCount = 0
    const creationFailures: any[] = []
    const validationIssues: any[] = []

    // Process records in batches for better performance
    const batchSize = parseInt(process.env.SYNC_BATCH_SIZE || '10')
    const batches = []

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize))
    }

    console.log(`🔄 Processing ${batches.length} batches of ${batchSize} records each`)

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(
        `\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} records)`,
      )

      // Process batch in parallel for better performance
      const batchPromises = batch.map(async (record) => {
        try {
          // --- MULTI-FLOOR SPLIT LOGIC ---
          if (typeof record.floor === 'string' && record.floor.includes(',')) {
            const floorNames = record.floor
              .split(',')
              .map((f) => f && f.trim())
              .filter((f) => !!f)
            // Map each floor to DB floor
            const mappedFloors = await Promise.all(
              floorNames.map((f) => (f ? getMappedFloor(payload, f) : null)),
            )
            // Deduplicate by mapped floor id
            const uniqueFloors = Array.from(
              new Map(mappedFloors.filter((f) => f && f.id).map((f) => [f!.id, f!])).values(),
            )
            if (uniqueFloors.length === 1) {
              // Only one unique mapped floor, sync as usual
              record.floor = uniqueFloors[0].name
              record.floorRevised = uniqueFloors[0].name
              const result = await syncRecord(payload, record)
              return {
                success: true,
                record,
                validationIssues: result?.validationIssues || [],
                error: undefined,
              }
            } else {
              // Multiple unique mapped floors, clone and sync for each
              const results = await Promise.all(
                uniqueFloors.map(async (floorObj) => {
                  if (!floorObj)
                    return { success: false, record, validationIssues: [], error: 'Null floorObj' }
                  const cloned = { ...record }
                  cloned.floor = floorObj.name
                  cloned.floorRevised = floorObj.name
                  // Append -FLOORCODE to uniqueId
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const floorCode = (floorObj as any)?.code ?? floorObj.name ?? floorObj.id
                  cloned.uniqueId = `${record.uniqueId}-${floorCode}`
                  const result = await syncRecord(payload, cloned)
                  return {
                    success: true,
                    record: cloned,
                    validationIssues: result?.validationIssues || [],
                    error: undefined,
                  }
                }),
              )
              return results[0] // just return first for batch count
            }
          } else {
            // Not a multi-floor record, sync as usual
            const result = await syncRecord(payload, record)
            return {
              success: true,
              record,
              validationIssues: result?.validationIssues || [],
              error: undefined,
            }
          }
        } catch (error) {
          return { success: false, record, validationIssues: [], error }
        }
      })

      const batchResults = await Promise.all(batchPromises)

      // Count successes and errors, collect validation issues
      batchResults.forEach((result) => {
        if (result && result.success) {
          successCount++
          // Collect validation issues from successful records
          if (result.validationIssues && result.validationIssues.length > 0) {
            validationIssues.push({
              record: result.record,
              issues: result.validationIssues,
            })
          }
        } else {
          errorCount++
          if (result && result.record) {
            console.error(`Error processing record ${result.record.uniqueId}:`, result.error)
          } else {
            console.error('Error processing record: Unknown record or error', result?.error)
          }
        }
      })

      console.log(
        `✅ Batch ${batchIndex + 1} completed: ${batchResults.filter((r) => r.success).length}/${batch.length} successful`,
      )
    }

    console.log('\n=== Sync Summary ===')
    console.log(`✅ Successfully synced: ${successCount} records`)
    console.log(`❌ Errors: ${errorCount} records`)
    console.log(`🚫 Creation Failures: ${creationFailures.length} records`)
    console.log(`⚠️  Validation Issues: ${validationIssues.length} records`)
    console.log(`📊 Total records processed: ${records.length}`)

    // Display validation issues summary
    if (validationIssues.length > 0) {
      console.log('\n=== Validation Issues Summary ===')
      const issueTypes: { [key: string]: number } = {}
      validationIssues.forEach(({ issues }) => {
        issues.forEach((issue: string) => {
          issueTypes[issue] = (issueTypes[issue] || 0) + 1
        })
      })

      Object.entries(issueTypes).forEach(([issue, count]) => {
        console.log(`   ${issue}: ${count} records`)
      })
    }

    // Display unmapped floor names
    if (unmappedFloors.size > 0) {
      console.log('\n=== Unmapped/Missing Floor Names ===')
      console.log('⚠️  The following floor names could not be mapped or do not exist:')
      const sortedUnmappedFloors = Array.from(unmappedFloors).sort((a, b) => a.localeCompare(b))
      sortedUnmappedFloors.forEach((floorName) => {
        console.log(`   - "${floorName}"`)
      })
      console.log('\n💡 To fix this:')
      console.log(
        '   1. Add missing floor names to the floorMapping object in the findFloor function',
      )
      console.log('2. Create the missing floors manually in the admin panel')
      sortedUnmappedFloors.forEach((floorName) => {
        console.log(`   '${floorName}': 'TARGET_FLOOR',`)
      })
    } else {
      console.log('\n✅ All floor names were successfully mapped!')
    }

    // Display unmapped category names
    if (unmappedCategories.size > 0) {
      console.log('\n=== Unmapped/Missing Category Names ===')
      console.log('⚠️  The following category names could not be found:')
      const sortedUnmappedCategories = Array.from(unmappedCategories)
        .map((cat) => JSON.parse(cat))
        .sort((a, b) => a.name.localeCompare(b.name))

      sortedUnmappedCategories.forEach((categoryInfo) => {
        console.log(`   - "${categoryInfo.name}" (${categoryInfo.type})`)
        console.log(`     English: "${categoryInfo.englishName}"`)
        console.log(`     Thai: "${categoryInfo.thaiName}"`)
      })
      console.log('\n💡 To fix this:')
      console.log('   1. Create the missing categories manually in the admin panel')
      console.log('   2. Ensure category names match exactly (case-sensitive)')
      console.log('   3. Check if categories exist with different names')
    } else {
      console.log('\n✅ All category names were successfully found!')
    }
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    process.exit(0)
  }
}

syncExternalApi()
