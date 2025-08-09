export function htmlToLexical(html: string): any {
  if (!html || typeof html !== 'string') {
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

  // Simple HTML to Lexical conversion
  // This is a basic implementation - you might want to use a more robust parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const children: any[] = []

  // Process each child node
  for (const node of doc.body.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        children.push({
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: node.textContent,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      if (tagName === 'p') {
        children.push({
          children: processTextNodes(element),
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        })
      } else if (tagName.match(/^h[1-6]$/)) {
        children.push({
          children: processTextNodes(element),
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: tagName,
          type: 'heading',
          version: 1,
        })
      } else if (tagName === 'ul' || tagName === 'ol') {
        children.push({
          children: processListItems(element),
          direction: 'ltr',
          format: '',
          indent: 0,
          listType: tagName === 'ol' ? 'number' : 'bullet',
          start: tagName === 'ol' ? 1 : undefined,
          tag: tagName,
          type: 'list',
          version: 1,
        })
      }
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

function processTextNodes(element: Element): any[] {
  const children: any[] = []

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        children.push({
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: node.textContent,
          type: 'text',
          version: 1,
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = node as Element
      const tagName = childElement.tagName.toLowerCase()

      let format = 0
      if (tagName === 'strong' || tagName === 'b') format |= 1 // bold
      if (tagName === 'em' || tagName === 'i') format |= 2 // italic
      if (tagName === 'u') format |= 4 // underline

      const textContent = childElement.textContent
      if (textContent?.trim()) {
        children.push({
          detail: 0,
          format,
          mode: 'normal',
          style: '',
          text: textContent,
          type: 'text',
          version: 1,
        })
      }
    }
  }

  return children
}

function processListItems(element: Element): any[] {
  const children: any[] = []

  for (const node of element.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const childElement = node as Element
      if (childElement.tagName.toLowerCase() === 'li') {
        children.push({
          children: processTextNodes(childElement),
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'listitem',
          value: 1,
          version: 1,
        })
      }
    }
  }

  return children
}

// For server-side usage (Node.js environment)
export function htmlToLexicalServer(html: string): any {
  // Use a server-side HTML parser like jsdom or cheerio
  // This is a simplified version
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
              text: html.replace(/<[^>]*>/g, ''), // Strip HTML tags
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
