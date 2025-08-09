import type { Field } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const safeHybridRichTextField = (
  options: {
    name?: string
    label?: string
    localized?: boolean
    required?: boolean
    includeHtmlField?: boolean // Whether to include a computed HTML field
  } = {},
): Field => ({
  name: options.name || 'content',
  type: 'richText',
  label: options.label || 'Content',
  localized: options.localized !== false,
  required: options.required,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  hooks: {
    beforeValidate: [
      ({ value }) => {
        // If the value is a string (HTML), convert it to Lexical format
        if (typeof value === 'string' && value.trim()) {
          return {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: value,
                      type: 'text',
                      version: 1,
                    },
                  ],
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
        return value
      },
    ],
  },
  // Add computed fields if needed
  ...(options.includeHtmlField && {
    fields: [
      {
        name: 'contentHtml',
        type: 'text',
        admin: {
          readOnly: true,
          description: 'HTML version of the content (computed)',
        },
        hooks: {
          afterRead: [
            ({ data, siblingData }) => {
              if (siblingData && typeof siblingData === 'object' && siblingData.root) {
                return lexicalToHtmlSafe(siblingData)
              }
              return ''
            },
          ],
        },
      },
    ],
  }),
})

// Safe version of lexicalToHtml that doesn't create circular references
function lexicalToHtmlSafe(lexicalContent: any): string {
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
