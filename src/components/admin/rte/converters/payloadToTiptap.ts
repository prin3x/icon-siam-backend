// Pure converter: PayloadCMS rich text (array form) -> TipTap JSON
// Keep logic aligned with previous in-file implementation

export const convertPayloadToTiptap = (payloadValue: any): any => {
  if (!payloadValue) return { type: 'doc', content: [] }

  if (typeof payloadValue === 'string') {
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: payloadValue }] }],
    }
  }

  // If already TipTap doc
  if (payloadValue?.type === 'doc') return payloadValue

  // Lexical JSON (Payload v2 richText) → TipTap
  if (payloadValue && typeof payloadValue === 'object' && payloadValue.root?.type === 'root') {
    const FORMAT_BOLD = 1
    const FORMAT_ITALIC = 2
    const FORMAT_STRIKE = 4
    const FORMAT_UNDERLINE = 8
    const FORMAT_CODE = 16

    const getMarksFromFormat = (format: number | undefined): any[] => {
      const marks: any[] = []
      if (!format || typeof format !== 'number') return marks
      if (format & FORMAT_BOLD) marks.push({ type: 'bold' })
      if (format & FORMAT_ITALIC) marks.push({ type: 'italic' })
      if (format & FORMAT_UNDERLINE) marks.push({ type: 'underline' })
      if (format & FORMAT_STRIKE) marks.push({ type: 'strike' })
      if (format & FORMAT_CODE) marks.push({ type: 'code' })
      return marks
    }

    const paragraphs = Array.isArray(payloadValue.root.children) ? payloadValue.root.children : []

    const content = paragraphs
      .filter((node: any) => node?.type === 'paragraph')
      .map((para: any) => {
        const children: any[] = Array.isArray(para.children) ? para.children : []
        const tiptapChildren = children
          .filter((c: any) => c?.type === 'text')
          .map((c: any) => {
            const text = typeof c.text === 'string' ? c.text : ''
            const marks = getMarksFromFormat(c.format)
            const node: any = { type: 'text', text }
            if (marks.length > 0) node.marks = marks
            return node
          })
          .filter((n: any) => typeof n.text === 'string')

        if (tiptapChildren.length === 0) {
          return { type: 'paragraph' }
        }

        return { type: 'paragraph', content: tiptapChildren }
      })

    return { type: 'doc', content }
  }

  if (Array.isArray(payloadValue)) {
    const content = payloadValue.map((node: any) => {
      if (node.type === 'upload' && node.value?.url) {
        return {
          type: 'image',
          attrs: {
            src: node.value.url,
            alt: node.value.filename,
            'data-id': node.value.id,
            ...(node.value.href ? { href: node.value.href } : {}),
            ...(node.value.target ? { target: node.value.target } : {}),
          },
        }
      }

      if (node.type === 'horizontalRule') {
        return { type: 'horizontalRule' }
      }

      if (node.type === 'blockquote') {
        // Assume payload already stores tiptap-like blockquote content
        return {
          type: 'blockquote',
          content: node.content || [],
        }
      }

      if (node.type === 'paragraph' && node.children) {
        // empty paragraph
        if (
          node.children.length === 1 &&
          node.children[0].text === '' &&
          Object.keys(node.children[0]).length === 1
        ) {
          return { type: 'paragraph' }
        }

        const textAlign = node.attrs?.textAlign || 'left'

        // Filter out empty text children to avoid invalid/empty nodes breaking rendering
        const filteredChildren = (node.children || []).filter((child: any) => {
          const text = typeof child.text === 'string' ? child.text : ''
          const hasLink = Boolean(child.link)
          return text.trim().length > 0 || hasLink
        })

        if (filteredChildren.length === 0) {
          return { type: 'paragraph' }
        }

        return {
          type: 'paragraph',
          attrs: { textAlign },
          content: filteredChildren.map((child: any) => {
            const marks: any[] = []
            if (child.bold) marks.push({ type: 'bold' })
            if (child.italic) marks.push({ type: 'italic' })
            if (child.underline) marks.push({ type: 'underline' })
            if (child.strike) marks.push({ type: 'strike' })
            if (child.code) marks.push({ type: 'code' })
            if (child.link)
              marks.push({
                type: 'link',
                attrs: { href: child.link.url, target: child.link.target || '_blank' },
              })

            const tiptapChild: any = { type: 'text', text: child.text || '' }
            if (marks.length > 0) tiptapChild.marks = marks
            return tiptapChild
          }),
        }
      }

      // default paragraph
      return { type: 'paragraph' }
    })

    return { type: 'doc', content }
  }

  return { type: 'doc', content: [] }
}
