import { getPayload } from 'payload'
import config from '../src/payload.config'

interface MigrationOptions {
  direction: 'html-to-lexical' | 'lexical-to-html'
  collection: string
  field: string
  dryRun?: boolean
}

// Enhanced HTML to Lexical conversion
function htmlToLexicalEnhanced(html: string): any {
  if (!html || typeof html !== 'string') {
    return createEmptyLexical()
  }

  // Use a more robust HTML parser (you might want to install jsdom or cheerio)
  const cleanHtml = html.trim()

  // Simple regex-based parsing for common HTML elements
  const paragraphs = cleanHtml.match(/<p[^>]*>(.*?)<\/p>/gs) || []
  const headings = cleanHtml.match(/<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gs) || []
  const lists = cleanHtml.match(/<(ul|ol)[^>]*>(.*?)<\/(ul|ol)>/gs) || []

  const children: any[] = []

  // Process paragraphs
  paragraphs.forEach((p) => {
    const content = p.replace(/<p[^>]*>|<\/p>/g, '').trim()
    if (content) {
      children.push(createParagraphNode(content))
    }
  })

  // Process headings
  headings.forEach((h) => {
    const match = h.match(/<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/)
    if (match) {
      const [, tag, content] = match
      const cleanContent = content.replace(/<[^>]*>/g, '').trim()
      if (cleanContent) {
        children.push(createHeadingNode(tag, cleanContent))
      }
    }
  })

  // Process lists
  lists.forEach((list) => {
    const listType = list.includes('<ul') ? 'bullet' : 'number'
    const items = list.match(/<li[^>]*>(.*?)<\/li>/gs) || []
    const listItems = items.map((item) => {
      const content = item.replace(/<li[^>]*>|<\/li>/g, '').trim()
      return createListItemNode(content)
    })

    if (listItems.length > 0) {
      children.push(createListNode(listType, listItems))
    }
  })

  // If no structured content found, treat as plain text
  if (children.length === 0 && cleanHtml) {
    const plainText = cleanHtml.replace(/<[^>]*>/g, '').trim()
    if (plainText) {
      children.push(createParagraphNode(plainText))
    }
  }

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function createEmptyLexical(): any {
  return {
    root: {
      children: [
        {
          children: [],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function createParagraphNode(text: string): any {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

function createHeadingNode(tag: string, text: string): any {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

function createListItemNode(text: string): any {
  return {
    children: [
      {
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        type: 'text',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    value: 1,
    version: 1,
  }
}

function createListNode(listType: 'bullet' | 'number', items: any[]): any {
  return {
    children: items,
    direction: 'ltr',
    format: '',
    indent: 0,
    listType,
    start: listType === 'number' ? 1 : undefined,
    tag: listType === 'number' ? 'ol' : 'ul',
    type: 'list',
    version: 1,
  }
}

// Enhanced Lexical to HTML conversion
function lexicalToHtmlEnhanced(lexicalContent: any): string {
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

async function migrateRichText(options: MigrationOptions) {
  const payload = await getPayload({ config })

  console.log(`Starting migration: ${options.direction}`)
  console.log(`Collection: ${options.collection}`)
  console.log(`Field: ${options.field}`)
  console.log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`)

  try {
    // Find all records in the collection
    const records = await payload.find({
      collection: options.collection,
      limit: 1000,
    })

    console.log(`Found ${records.docs.length} records to process`)

    let updated = 0
    let skipped = 0
    let errors = 0

    for (const record of records.docs) {
      try {
        const fieldValue = record[options.field]

        if (!fieldValue) {
          skipped++
          continue
        }

        let newValue: any

        if (options.direction === 'html-to-lexical') {
          if (typeof fieldValue === 'string') {
            newValue = htmlToLexicalEnhanced(fieldValue)
          } else {
            skipped++
            continue
          }
        } else {
          if (typeof fieldValue === 'object' && fieldValue.root) {
            newValue = lexicalToHtmlEnhanced(fieldValue)
          } else {
            skipped++
            continue
          }
        }

        if (options.dryRun) {
          console.log(`[DRY RUN] Would update record ${record.id}`)
        } else {
          await payload.update({
            collection: options.collection,
            id: record.id,
            data: {
              [options.field]: newValue,
            },
          })
          console.log(`✅ Updated record ${record.id}`)
        }

        updated++
      } catch (error) {
        errors++
        console.error(`❌ Error processing record ${record.id}:`, error)
      }
    }

    console.log(`\nMigration complete:`)
    console.log(`- Updated: ${updated}`)
    console.log(`- Skipped: ${skipped}`)
    console.log(`- Errors: ${errors}`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

// Example usage:
// migrateRichText({
//   direction: 'html-to-lexical',
//   collection: 'events',
//   field: 'content',
//   dryRun: true
// })

export { migrateRichText, htmlToLexicalEnhanced, lexicalToHtmlEnhanced }
