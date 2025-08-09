import { getPayload } from 'payload'
import config from '../src/payload.config'

interface LegacyRecord {
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
  promotion_type?: string
  event_type?: string
  tags: string
  related_content: string
  related_content_promotion?: string
  related_content_event?: string
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

// Helper function to convert Lexical rich text to HTML
function lexicalToHtml(lexicalContent: any): string {
  if (!lexicalContent || !lexicalContent.root || !lexicalContent.root.children) {
    return ''
  }

  let html = ''

  for (const child of lexicalContent.root.children) {
    if (child.type === 'paragraph') {
      html += '<p>'
      if (child.children) {
        for (const textChild of child.children) {
          if (textChild.text) {
            let text = textChild.text
            if (textChild.format & 1) text = `<strong>${text}</strong>` // bold
            if (textChild.format & 2) text = `<em>${text}</em>` // italic
            if (textChild.format & 4) text = `<u>${text}</u>` // underline
            html += text
          }
        }
      }
      html += '</p>'
    } else if (child.type === 'heading') {
      const level = child.tag || 'h1'
      html += `<${level}>`
      if (child.children) {
        for (const textChild of child.children) {
          if (textChild.text) {
            let text = textChild.text
            if (textChild.format & 1) text = `<strong>${text}</strong>`
            if (textChild.format & 2) text = `<em>${text}</em>`
            if (textChild.format & 4) text = `<u>${text}</u>`
            html += text
          }
        }
      }
      html += `</${level}>`
    } else if (child.type === 'list') {
      const listType = child.listType === 'number' ? 'ol' : 'ul'
      html += `<${listType}>`
      if (child.children) {
        for (const listItem of child.children) {
          if (listItem.type === 'listitem') {
            html += '<li>'
            if (listItem.children) {
              for (const textChild of listItem.children) {
                if (textChild.text) {
                  let text = textChild.text
                  if (textChild.format & 1) text = `<strong>${text}</strong>`
                  if (textChild.format & 2) text = `<em>${text}</em>`
                  if (textChild.format & 4) text = `<u>${text}</u>`
                  html += text
                }
              }
            }
            html += '</li>'
          }
        }
      }
      html += `</${listType}>`
    }
  }

  return html
}

// Helper function to check if content is Lexical rich text
function isLexicalRichText(content: any): boolean {
  return (
    content &&
    typeof content === 'object' &&
    content.root &&
    content.root.children &&
    content.root.children.length > 0
  )
}

async function patchRichTextOnly() {
  const payload = await getPayload({ config })

  try {
    // Find all current events that have Lexical rich text content
    const currentEvents = await payload.find({
      collection: 'events',
      where: {
        'content.root.children': {
          exists: true,
        },
      },
      limit: 1000, // Adjust as needed
    })

    console.log(`Found ${currentEvents.docs.length} current events with Lexical rich text content`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const currentEvent of currentEvents.docs) {
      try {
        console.log(`Processing event ID: ${currentEvent.id} - Title: ${currentEvent.title}`)

        // Convert Lexical rich text to HTML for each locale
        const locales: ('th' | 'en' | 'zh')[] = ['th', 'en', 'zh']
        let updatedLocales = []

        for (const locale of locales) {
          try {
            // Get the event content for this locale
            const eventWithLocale = await payload.findByID({
              collection: 'events',
              id: currentEvent.id,
              locale: locale,
            })

            if (eventWithLocale && isLexicalRichText(eventWithLocale.content)) {
              // Convert Lexical to HTML using serialize-like approach
              const htmlContent = lexicalToHtml(eventWithLocale.content)

              if (htmlContent.trim()) {
                // Update with HTML content
                await payload.update({
                  collection: 'events',
                  id: currentEvent.id,
                  data: {
                    content: htmlContent as any,
                  },
                  locale: locale,
                })
                updatedLocales.push(locale)
                console.log(
                  `✅ Converted Lexical to HTML for event ID: ${currentEvent.id} (${locale})`,
                )
              } else {
                console.log(
                  `⚠️  No content to convert for event ID: ${currentEvent.id} (${locale})`,
                )
              }
            } else {
              console.log(
                `⚠️  No Lexical content found for event ID: ${currentEvent.id} (${locale})`,
              )
            }
          } catch (localeError) {
            console.log(`⚠️  Could not process locale ${locale} for event ID: ${currentEvent.id}`)
          }
        }

        if (updatedLocales.length > 0) {
          updated++
        } else {
          skipped++
        }
      } catch (error) {
        errors++
        console.error(`Error processing event ID ${currentEvent.id}:`, error)
      }
    }

    console.log(`\nLexical to HTML conversion complete:`)
    console.log(`- Updated records: ${updated}`)
    console.log(`- Skipped: ${skipped}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('Error processing events:', error)
  } finally {
    process.exit(0)
  }
}

// Run the script
patchRichTextOnly().catch(console.error)
