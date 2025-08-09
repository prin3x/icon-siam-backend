// Safe utility functions for rich text conversion without circular references

export function safeLexicalToHtml(lexicalContent: any): string {
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

export function safeHtmlToLexical(html: string): any {
  if (!html || typeof html !== 'string') {
    return createEmptyLexical()
  }

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

// Utility to safely clone objects without circular references
export function safeClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (Array.isArray(obj)) {
    return obj.map(safeClone)
  }

  const cloned: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = safeClone(obj[key])
    }
  }

  return cloned
}

// Utility to check if an object has circular references
export function hasCircularReference(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== 'object') {
    return false
  }

  if (seen.has(obj)) {
    return true
  }

  seen.add(obj)

  if (Array.isArray(obj)) {
    return obj.some((item) => hasCircularReference(item, seen))
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (hasCircularReference(obj[key], seen)) {
        return true
      }
    }
  }

  return false
}
