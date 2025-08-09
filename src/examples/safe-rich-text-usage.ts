import { hybridRichTextField } from '@/fields/hybridRichText'
import { safeHybridRichTextField } from '@/fields/safeHybridRichText'
import { safeLexicalToHtml, safeHtmlToLexical, hasCircularReference } from '@/utilities/safeRichTextConversion'

// Example 1: Using the safe hybrid field
export const SafeExampleCollection = {
  slug: 'safe-example',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    // Use the safe hybrid field
    safeHybridRichTextField({
      name: 'content',
      label: 'Content',
      localized: true,
      includeHtmlField: true, // This adds a computed HTML field
    }),
  ],
}

// Example 2: Manual conversion without circular references
export async function safeContentConversion() {
  // Convert HTML to Lexical safely
  const htmlContent = '<p>This is <strong>bold</strong> text</p>'
  const lexicalContent = safeHtmlToLexical(htmlContent)
  
  // Check for circular references
  if (hasCircularReference(lexicalContent)) {
    console.error('Circular reference detected!')
    return
  }
  
  // Convert back to HTML safely
  const convertedHtml = safeLexicalToHtml(lexicalContent)
  console.log('Converted HTML:', convertedHtml)
}

// Example 3: API endpoint with safe conversion
export async function safeConversionAPI(req: Request, res: Response) {
  try {
    const { content, direction } = req.body
    
    let result
    
    if (direction === 'html-to-lexical') {
      result = safeHtmlToLexical(content)
    } else if (direction === 'lexical-to-html') {
      result = safeLexicalToHtml(content)
    } else {
      return res.status(400).json({ error: 'Invalid direction' })
    }
    
    // Check for circular references before sending
    if (hasCircularReference(result)) {
      return res.status(500).json({ error: 'Circular reference detected' })
    }
    
    res.json({ result })
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' })
  }
}

// Example 4: Frontend rendering with safety checks
export function SafeRichTextRenderer({ content }: { content: any }) {
  if (hasCircularReference(content)) {
    console.error('Circular reference in content')
    return <div>Error: Invalid content structure</div>
  }
  
  if (typeof content === 'string') {
    // HTML content
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  } else if (content && content.root) {
    // Lexical content - convert to HTML safely
    const html = safeLexicalToHtml(content)
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }
  
  return null
}

// Example 5: Collection with computed HTML field
export const CollectionWithComputedHtml = {
  slug: 'with-computed-html',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    // Computed HTML field
    {
      name: 'contentHtml',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'HTML version of content (computed)',
      },
      hooks: {
        afterRead: [
          ({ siblingData }) => {
            if (siblingData && typeof siblingData === 'object' && siblingData.root) {
              return safeLexicalToHtml(siblingData)
            }
            return ''
          },
        ],
      },
    },
  ],
}

// Example 6: Migration script with safety checks
export async function safeMigration() {
  const payload = await getPayload({ config })
  
  try {
    const records = await payload.find({
      collection: 'events',
      limit: 100,
    })
    
    for (const record of records.docs) {
      if (record.content && typeof record.content === 'string') {
        // Convert HTML to Lexical safely
        const lexicalContent = safeHtmlToLexical(record.content)
        
        // Check for circular references
        if (hasCircularReference(lexicalContent)) {
          console.error(`Circular reference in record ${record.id}`)
          continue
        }
        
        // Update the record
        await payload.update({
          collection: 'events',
          id: record.id,
          data: {
            content: lexicalContent,
          },
        })
        
        console.log(`✅ Updated record ${record.id}`)
      }
    }
  } catch (error) {
    console.error('Migration failed:', error)
  }
} 