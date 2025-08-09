import { getPayload } from 'payload'
import { readFileSync } from 'fs'
import { join } from 'path'
import config from '../src/payload.config'

interface LegacyEvent {
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
  event_type: string
  tags: string
  related_content: string
  related_content_event: string
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

function decodeHtmlEntitiesNode(text: string): string {
  if (!text) return text

  return (
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=')
      .replace(/&#x2B;/g, '+')
      // Handle numeric HTML entities
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      // Handle hexadecimal HTML entities
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  )
}

async function patchEvents() {
  const payload = await getPayload({ config })

  try {
    // Read the JSON file
    const jsonPath = join(process.cwd(), 'data', 'events-table-export-2.json')
    const jsonData = readFileSync(jsonPath, 'utf-8')
    const legacyEvents: LegacyEvent[] = JSON.parse(jsonData)

    console.log(`Found ${legacyEvents.length} events to update content for`)

    let updated = 0
    let created = 0
    let errors = 0

    for (const legacyEvent of legacyEvents) {
      if (legacyEvent.id !== 238) continue
      try {
        // Update existing event content only
        let updatedLocales = []

        if (legacyEvent.text_th) {
          // Find existing event by legacyEvent title
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_th,
              },
            },
            locale: 'th',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            await payload.update({
              collection: 'events',
              id: existingEvents.docs[0].id,
              data: {
                content: decodeHtmlEntitiesNode(legacyEvent.text_th) as any,
              },
              locale: 'th',
            })
            updatedLocales.push('th')
          }
        }

        if (legacyEvent.text_en) {
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_en,
              },
            },
            locale: 'en',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            await payload.update({
              collection: 'events',
              id: existingEvents.docs[0].id,
              data: {
                content: decodeHtmlEntitiesNode(legacyEvent.text_en) as any,
              },
              locale: 'en',
            })
            updatedLocales.push('en')
          }
        }

        if (legacyEvent.text_cn) {
          const existingEvents = await payload.find({
            collection: 'events',
            where: {
              title: {
                equals: legacyEvent.title_cn,
              },
            },
            locale: 'zh',
            limit: 1,
          })

          if (existingEvents.docs.length > 0) {
            await payload.update({
              collection: 'events',
              id: existingEvents.docs[0].id,
              data: {
                content: decodeHtmlEntitiesNode(legacyEvent.text_cn) as any,
              },
              locale: 'zh',
            })
            updatedLocales.push('zh')
          }
        }

        if (updatedLocales.length > 0) {
          updated++
          console.log(
            `✅ Updated content for event ID: ${legacyEvent.id} (locales: ${updatedLocales.join(', ')})`,
          )
        } else {
          console.log(`⚠️  No existing event found for ID ${legacyEvent.id} - skipping`)
        }
      } catch (error) {
        errors++
        console.error(`Error processing event ID ${legacyEvent.id}:`, error)
      }
    }

    console.log(`\nContent update complete:`)
    console.log(`- Updated content: ${updated}`)
    console.log(`- Skipped (not found): ${created}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('Error reading JSON file:', error)
  } finally {
    process.exit(0)
  }
}

// Run the script
patchEvents().catch(console.error)
