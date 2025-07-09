import { getPayload } from 'payload'
import config from '../payload.config'
import * as fs from 'fs'
import * as path from 'path'

interface FlaggedRecord {
  id: string
  title: string
  slug: string
  collection: string
  unique_id: string | null
  previous_status: string
  new_status: string
}

// Function to log flagged records to file
function logFlaggedRecords(flaggedRecords: FlaggedRecord[], summary: any) {
  const timestamp = new Date().toISOString()
  const logDir = path.join(process.cwd(), 'logs')

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const logFile = path.join(
    logDir,
    `flag-records-without-unique-id-${new Date().toISOString().split('T')[0]}.log`,
  )

  const logEntry =
    `[${timestamp}] Flag Records Without Unique ID Summary\n` +
    `📊 Total records processed: ${summary.totalRecords}\n` +
    `🚩 Records flagged as inactive: ${summary.flaggedCount}\n` +
    `✅ Records already inactive: ${summary.alreadyInactiveCount}\n` +
    `✅ Records with unique_id (kept active): ${summary.withUniqueIdCount}\n` +
    `📈 Flagged percentage: ${summary.flaggedPercentage}%\n` +
    `\n=== Flagged Records ===\n` +
    flaggedRecords
      .map(
        (record) =>
          `ID: ${record.id} | Collection: ${record.collection} | Title: "${record.title}" | Slug: "${record.slug}" | Previous Status: ${record.previous_status} → New Status: ${record.new_status}`,
      )
      .join('\n') +
    `\n---\n`

  try {
    fs.appendFileSync(logFile, logEntry)
    console.log(`📝 Summary logged to: ${logFile}`)
  } catch (writeError) {
    console.error('Failed to write log:', writeError)
  }
}

async function flagRecordsWithoutUniqueId() {
  const payload = await getPayload({ config })

  try {
    console.log('=== Starting Flag Records Without Unique ID ===')

    const flaggedRecords: FlaggedRecord[] = []
    let totalRecords = 0
    let flaggedCount = 0
    let alreadyInactiveCount = 0
    let withUniqueIdCount = 0

    // Process both shops and dinings collections
    const collections = ['shops', 'dinings'] as const

    for (const collectionName of collections) {
      console.log(`\n📦 Processing ${collectionName} collection...`)

      // Get all records from the collection
      const allRecords = await payload.find({
        collection: collectionName,
        limit: 1000, // Adjust if you have more records
      })

      console.log(`   Found ${allRecords.docs.length} records in ${collectionName}`)
      totalRecords += allRecords.docs.length

      for (const record of allRecords.docs) {
        const hasUniqueId = (record as any).unique_id && (record as any).unique_id.trim() !== ''
        const isActive = (record as any).status === 'ACTIVE'
        const isInactive = (record as any).status === 'INACTIVE'

        if (hasUniqueId) {
          // Record has unique_id, keep as is
          withUniqueIdCount++
          console.log(
            `   ✅ ${(record as any).title} (${(record as any).slug}) - Has unique_id, keeping ${(record as any).status}`,
          )
        } else if (isInactive) {
          // Record is already inactive, no change needed
          alreadyInactiveCount++
          console.log(
            `   ⚠️  ${(record as any).title} (${(record as any).slug}) - No unique_id but already INACTIVE`,
          )
        } else if (isActive) {
          // Record is active but has no unique_id, flag as inactive
          try {
            await payload.update({
              collection: collectionName,
              id: record.id,
              data: {
                status: 'INACTIVE',
              },
            })

            flaggedRecords.push({
              id: record.id.toString(),
              title: (record as any).title || 'Unknown',
              slug: (record as any).slug || 'unknown',
              collection: collectionName,
              unique_id: (record as any).unique_id || null,
              previous_status: (record as any).status || 'UNKNOWN',
              new_status: 'INACTIVE',
            })

            flaggedCount++
            console.log(
              `   🚩 ${(record as any).title} (${(record as any).slug}) - No unique_id, flagged as INACTIVE`,
            )
          } catch (error) {
            console.error(`   ❌ Error updating ${(record as any).title}:`, error)
          }
        }
      }
    }

    // Calculate summary
    const flaggedPercentage =
      totalRecords > 0 ? ((flaggedCount / totalRecords) * 100).toFixed(2) : '0'

    const summary = {
      totalRecords,
      flaggedCount,
      alreadyInactiveCount,
      withUniqueIdCount,
      flaggedPercentage,
    }

    console.log('\n=== Flag Records Summary ===')
    console.log(`📊 Total records processed: ${totalRecords}`)
    console.log(`🚩 Records flagged as inactive: ${flaggedCount}`)
    console.log(`✅ Records already inactive: ${alreadyInactiveCount}`)
    console.log(`✅ Records with unique_id (kept active): ${withUniqueIdCount}`)
    console.log(`📈 Flagged percentage: ${flaggedPercentage}%`)

    if (flaggedRecords.length > 0) {
      console.log('\n=== Flagged Records ===')
      flaggedRecords.forEach((record) => {
        console.log(
          `   ${record.collection}: "${record.title}" (${record.slug}) - ${record.previous_status} → ${record.new_status}`,
        )
      })
    } else {
      console.log('\n✅ No records needed to be flagged!')
    }

    // Log summary to file
    logFlaggedRecords(flaggedRecords, summary)

    console.log('\n=== Recommendations ===')
    if (flaggedCount > 0) {
      console.log('💡 Records without unique_id have been flagged as INACTIVE.')
      console.log('💡 These records should be synced from the external API to get their unique_id.')
      console.log('💡 Once synced, you can manually reactivate them if needed.')
    } else {
      console.log('✅ All records either have unique_id or are already inactive.')
    }
  } catch (error) {
    console.error('Flag records failed:', error)
  } finally {
    process.exit(0)
  }
}

flagRecordsWithoutUniqueId()
