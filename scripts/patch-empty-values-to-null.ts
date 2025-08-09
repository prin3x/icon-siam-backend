import { getPayload } from 'payload'
import config from '../src/payload.config'

// Helper function to check if a value is an empty string
function isEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim() === ''
}

// Helper function to clean title field (handles both regular and localized titles)
function cleanTitle(title: any): any {
  if (title === null || title === undefined) {
    return title
  }

  // Handle regular string titles
  if (typeof title === 'string') {
    return isEmptyString(title) ? null : title
  }

  // Handle localized titles (JSON object with en/th keys)
  if (typeof title === 'object' && title !== null) {
    const cleaned: any = {}
    let hasChanges = false

    // Check English title
    if (title.en !== undefined) {
      if (isEmptyString(title.en)) {
        cleaned.en = null
        hasChanges = true
      } else {
        cleaned.en = title.en
      }
    }

    // Check Thai title
    if (title.th !== undefined) {
      if (isEmptyString(title.th)) {
        cleaned.th = null
        hasChanges = true
      } else {
        cleaned.th = title.th
      }
    }

    // Only return cleaned object if there were changes
    return hasChanges ? cleaned : title
  }

  return title
}

async function patchEmptyValuesToNull() {
  const payload = await getPayload({ config })

  try {
    console.log('🔍 Starting patch for empty title values to null...')

    // Process Events
    console.log('\n📋 Processing Events...')
    await processCollection('events', payload)

    // Process Promotions
    console.log('\n📋 Processing Promotions...')
    await processCollection('promotions', payload)

    console.log('\n✅ Patch complete!')
  } catch (error) {
    console.error('❌ Error in patchEmptyValuesToNull:', error)
  } finally {
    process.exit(0)
  }
}

async function processCollection(collectionName: string, payload: any) {
  console.log(`🔍 Finding ${collectionName} with empty title values...`)

  // Get all documents from the collection
  const allDocs = await payload.find({
    collection: collectionName,
    limit: 1000, // Adjust as needed
  })

  console.log(`📊 Found ${allDocs.docs.length} ${collectionName}`)

  let updated = 0
  let errors = 0
  let skipped = 0

  for (const doc of allDocs.docs) {
    try {
      // Clean the title field
      const cleanedTitle = cleanTitle(doc.title)

      // Check if there are any changes
      if (JSON.stringify(cleanedTitle) === JSON.stringify(doc.title)) {
        skipped++
        continue
      }

      console.log(`   🔄 Updating ${collectionName}: ${doc.title || doc.id}`)

      // Update only the title field
      await payload.update({
        collection: collectionName,
        id: doc.id,
        data: {
          title: cleanedTitle,
        },
      })

      updated++
      console.log(`✅ Updated ${collectionName}: ${doc.title || doc.id}`)
    } catch (error) {
      errors++
      console.error(`❌ Error updating ${collectionName} ${doc.id}:`, error)
    }
  }

  console.log(`\n📈 ${collectionName} update complete:`)
  console.log(`- Updated: ${updated}`)
  console.log(`- Skipped: ${skipped}`)
  console.log(`- Errors: ${errors}`)
}

// Run the script
patchEmptyValuesToNull().catch(console.error)
