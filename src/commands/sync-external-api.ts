import { getPayload } from 'payload'
import config from '../payload.config'
import { findOrCreateFloor } from './find-or-create-floor'

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

// Find or create category
async function findOrCreateCategory(
  payload: any,
  categoryNameEn: string,
  categoryNameTh: string,
  type: 'shops' | 'dinings',
): Promise<string | null> {
  if (!categoryNameEn && !categoryNameTh) return null

  const searchName = categoryNameEn || categoryNameTh

  try {
    // Find existing category
    const existingCategory = await payload.find({
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
      return existingCategory.docs[0].id.toString()
    }

    // Create new category
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        name: categoryNameEn || categoryNameTh,
        slug: `${type}-${searchName.toLowerCase().replace(/\s+/g, '-')}`,
        type: type,
        status: 'ACTIVE',
      },
    })

    console.log(`✅ Created category: ${searchName} (${type})`)
    return newCategory.id.toString()
  } catch (error) {
    console.error(`❌ Error finding or creating category ${searchName}:`, error)
    return null
  }
}

// Create media record from URL
async function createMediaRecord(
  payload: any,
  imageUrl: string,
  altText: string,
): Promise<string | null> {
  // Media functionality removed - always return null
  return null
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

  // Parse format like "10.00 - 22.00"
  const timeMatch = openingHours.match(/(\d+\.\d+)\s*-\s*(\d+\.\d+)/)
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

// Parse status
function parseStatus(status: boolean, statusRevised: string): 'ACTIVE' | 'INACTIVE' {
  // If statusRevised has specific values, use those
  if (statusRevised) {
    const statusLower = statusRevised.toLowerCase()
    if (statusLower.includes('active') || statusLower.includes('open')) {
      return 'ACTIVE'
    }
    if (statusLower.includes('inactive') || statusLower.includes('closed')) {
      return 'INACTIVE'
    }
    if (statusLower.includes('coming')) {
      return 'INACTIVE' // Treat "Coming Soon" as inactive
    }
  }

  // Fall back to boolean status
  return status ? 'ACTIVE' : 'INACTIVE'
}

// Utility to merge data while preserving existing non-empty values
function mergeDataPreservingExisting(existingData: any, newData: any): any {
  const merged = { ...existingData }

  for (const [key, newValue] of Object.entries(newData)) {
    if (newValue === null || newValue === undefined || newValue === '') {
      // Skip null/undefined/empty values from new data
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

    // Find or create floor - try floorRevised first, then fall back to floor
    const floor = await findOrCreateFloor(
      payload,
      record.floorRevised || record.floor,
      unmappedFloors,
    )

    const floorId = floor?.id?.toString()

    // Find or create category
    const categoryId = await findOrCreateCategory(
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

    // Create base data with only non-empty values
    const baseData: any = {}

    // Only add fields that have actual values
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

    // Handle status
    baseData.status = parseStatus(record.status, record.statusRevised)

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

    // Generate slug
    baseData.slug = `${record.brandNameEn?.toLowerCase().replace(/\s+/g, '-')}-${record.tenantId}`

    // Check if record already exists
    const existingRecord = await payload.find({
      collection,
      where: {
        title: {
          ilike: `%${decodeText(record.brandNameEn || record.shopNameEnglish).toLowerCase()}%`,
        },
      },
      locale: 'en',
      limit: 1,
    })

    // If not found by English name, try searching by Thai name
    let existingRecordData = null
    if (existingRecord.docs.length === 0 && (record.brandNameTh || record.shopNameThai)) {
      const thaiSearch = await payload.find({
        collection,
        where: {
          title: {
            ilike: `%${decodeText(record.brandNameTh || record.shopNameThai).toLowerCase()}%`,
          },
        },
        locale: 'th',
        limit: 1,
      })

      if (thaiSearch.docs.length > 0) {
        existingRecordData = thaiSearch.docs[0]
        console.log(
          `Found existing record by Thai name: ${record.brandNameTh || record.shopNameThai}`,
        )
      }
    } else if (existingRecord.docs.length > 0) {
      existingRecordData = existingRecord.docs[0]
      console.log(
        `Found existing record by English name: ${record.brandNameEn || record.shopNameEnglish}`,
      )
    }

    if (existingRecordData) {
      // Update existing record - merge with existing data
      const existingId = existingRecordData.id
      const existingData = existingRecordData

      // Merge new data with existing data, preserving existing non-empty values
      const mergedData = mergeDataPreservingExisting(existingData, baseData)

      // Update English version
      await payload.update({
        collection,
        id: existingId,
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
    } else {
      // Create new record with default values for required fields
      const createData = {
        ...baseData,
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
        categories: categoryId ? [parseInt(categoryId)] : [],
      }

      const newRecord = await payload.create({
        collection,
        data: createData,
        locale: 'en',
      })

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
          where: { slug: { equals: baseData.slug } },
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
          where: { slug: { equals: baseData.slug } },
          data: zhData,
          locale: 'zh',
        })
      }

      console.log(`✅ Created ${recordType}: ${record.brandNameEn || record.shopNameEnglish}`)
    }
  } catch (error) {
    console.error(`❌ Error syncing record ${record.uniqueId}:`, error)
  }
}

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

    let successCount = 0
    let errorCount = 0

    // Process each record
    for (const record of records) {
      try {
        await syncRecord(payload, record)
        successCount++
      } catch (error) {
        console.error(`Error processing record ${record.uniqueId}:`, error)
        errorCount++
      }
    }

    console.log('\n=== Sync Summary ===')
    console.log(`✅ Successfully synced: ${successCount} records`)
    console.log(`❌ Errors: ${errorCount} records`)
    console.log(`📊 Total records processed: ${records.length}`)

    // Display unmapped floor names
    if (unmappedFloors.size > 0) {
      console.log('\n=== Unmapped Floor Names ===')
      console.log('⚠️  The following floor names could not be mapped:')
      const sortedUnmappedFloors = Array.from(unmappedFloors).sort((a, b) => a.localeCompare(b))
      sortedUnmappedFloors.forEach((floorName) => {
        console.log(`   - "${floorName}"`)
      })
      console.log('\n💡 Add these to the floorMapping object in the findOrCreateFloor function:')
      sortedUnmappedFloors.forEach((floorName) => {
        console.log(`   '${floorName}': 'TARGET_FLOOR',`)
      })
    } else {
      console.log('\n✅ All floor names were successfully mapped!')
    }
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    process.exit(0)
  }
}

syncExternalApi()
