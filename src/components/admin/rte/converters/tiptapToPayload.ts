// Pure converter: TipTap JSON doc -> PayloadCMS rich text array (flat)

export const convertTiptapToPayload = (tiptapValue: any): any => {
  if (!tiptapValue || !tiptapValue.content) return []

  return tiptapValue.content
    .map((node: any) => {
      if (node.type === 'image') {
        const id = node.attrs?.['data-id']
        const src = node.attrs?.src
        const alt = node.attrs?.alt || 'Image'
        const href = node.attrs?.href
        const target = node.attrs?.target || '_blank'

        if (id) {
          return {
            type: 'upload',
            value: {
              id,
              url: src,
              filename: alt,
              href: href || undefined,
              target: href ? target : undefined,
            },
            relationTo: 'media',
            children: [{ text: '' }],
          }
        }
        if (src) {
          return { type: 'paragraph', children: [{ text: `[Image: ${alt}] - Source: ${src}` }] }
        }
        return { type: 'paragraph', children: [{ text: `[Image: ${alt}]` }] }
      }

      if (node.type === 'horizontalRule') {
        return { type: 'horizontalRule' }
      }

      if (node.type === 'blockquote') {
        // Preserve blockquote and its inner paragraph/content
        return {
          type: 'blockquote',
          content: node.content || [],
        }
      }

      if (node.type === 'paragraph') {
        if (!node.content) {
          return { type: 'paragraph', children: [{ text: '' }] }
        }

        return {
          type: 'paragraph',
          attrs: node.attrs?.textAlign ? { textAlign: node.attrs.textAlign } : undefined,
          children:
            node.content?.map((child: any) => {
              const payloadChild: any = { text: child.text || '' }
              if (child.marks?.some((m: any) => m.type === 'bold')) payloadChild.bold = true
              if (child.marks?.some((m: any) => m.type === 'italic')) payloadChild.italic = true
              if (child.marks?.some((m: any) => m.type === 'underline'))
                payloadChild.underline = true
              if (child.marks?.some((m: any) => m.type === 'strike')) payloadChild.strike = true
              if (child.marks?.some((m: any) => m.type === 'code')) payloadChild.code = true
              const linkMark = child.marks?.find((m: any) => m.type === 'link')
              if (linkMark) {
                payloadChild.link = {
                  url: linkMark.attrs.href,
                  target: linkMark.attrs.target || '_blank',
                }
              }
              return payloadChild
            }) || [],
        }
      }

      if (node.type === 'bulletList' || node.type === 'orderedList') {
        const listItems =
          node.content
            ?.map((item: any, idx: number) => {
              if (item.type === 'listItem' && item.content?.[0]?.type === 'paragraph') {
                return {
                  type: 'paragraph',
                  children: item.content[0].content?.map((child: any) => ({
                    text: (
                      (node.type === 'bulletList' ? '• ' : `${idx + 1}. `) + (child.text || '')
                    ).trim(),
                    ...(child.marks?.some((m: any) => m.type === 'bold') && { bold: true }),
                    ...(child.marks?.some((m: any) => m.type === 'italic') && { italic: true }),
                    ...(child.marks?.some((m: any) => m.type === 'underline') && {
                      underline: true,
                    }),
                    ...(child.marks?.some((m: any) => m.type === 'strike') && { strike: true }),
                    ...(child.marks?.some((m: any) => m.type === 'code') && { code: true }),
                    ...(child.marks?.find((m: any) => m.type === 'link') && {
                      link: {
                        url: child.marks.find((m: any) => m.type === 'link').attrs.href,
                        target:
                          child.marks.find((m: any) => m.type === 'link').attrs.target || '_blank',
                      },
                    }),
                  })) || [{ text: '' }],
                }
              }
              return null
            })
            ?.filter(Boolean) || []

        return listItems
      }

      return null
    })
    .filter(Boolean)
    .flat()
}
