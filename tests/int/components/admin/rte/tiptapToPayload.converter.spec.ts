import { describe, it, expect } from 'vitest'
import { convertTiptapToPayload } from '@/components/admin/rte/converters/tiptapToPayload'

describe('convertTiptapToPayload', () => {
  it('returns empty array for nullish', () => {
    expect(convertTiptapToPayload(null as any)).toEqual([])
    expect(convertTiptapToPayload({} as any)).toEqual([])
  })

  it('maps image with data-id to upload payload', () => {
    const out = convertTiptapToPayload({
      content: [
        {
          type: 'image',
          attrs: {
            'data-id': '1',
            src: 'https://x/y.png',
            alt: 'z',
            href: 'https://a',
            target: '_self',
          },
        },
      ],
    })
    expect(out[0]).toEqual({
      type: 'upload',
      value: {
        id: '1',
        url: 'https://x/y.png',
        filename: 'z',
        href: 'https://a',
        target: '_self',
      },
      relationTo: 'media',
      children: [{ text: '' }],
    })
  })

  it('maps image without id to paragraph text', () => {
    const out1 = convertTiptapToPayload({
      content: [{ type: 'image', attrs: { src: 'u', alt: 'a' } }],
    })
    expect(out1[0]).toEqual({ type: 'paragraph', children: [{ text: '[Image: a] - Source: u' }] })

    const out2 = convertTiptapToPayload({ content: [{ type: 'image', attrs: { alt: 'a' } }] })
    expect(out2[0]).toEqual({ type: 'paragraph', children: [{ text: '[Image: a]' }] })
  })

  it('horizontalRule and blockquote are preserved', () => {
    const out = convertTiptapToPayload({
      content: [
        { type: 'horizontalRule' },
        { type: 'blockquote', content: [{ type: 'paragraph' }] },
      ],
    })
    expect(out[0]).toEqual({ type: 'horizontalRule' })
    expect(out[1]).toEqual({ type: 'blockquote', content: [{ type: 'paragraph' }] })
  })

  it('paragraph converts marks and link to payload flags and link object', () => {
    const out = convertTiptapToPayload({
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', text: 'B', marks: [{ type: 'bold' }] },
            { type: 'text', text: 'I', marks: [{ type: 'italic' }] },
            { type: 'text', text: 'U', marks: [{ type: 'underline' }] },
            { type: 'text', text: 'S', marks: [{ type: 'strike' }] },
            { type: 'text', text: 'C', marks: [{ type: 'code' }] },
            {
              type: 'text',
              text: 'L',
              marks: [{ type: 'link', attrs: { href: 'h', target: '_self' } }],
            },
          ],
        },
      ],
    })

    const para = out[0]
    expect(para.attrs).toEqual({ textAlign: 'center' })
    const flags = para.children.map((c: any) => ({
      text: c.text,
      bold: !!c.bold,
      italic: !!c.italic,
      underline: !!c.underline,
      strike: !!c.strike,
      code: !!c.code,
      link: c.link || null,
    }))
    expect(flags).toEqual([
      {
        text: 'B',
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        code: false,
        link: null,
      },
      {
        text: 'I',
        bold: false,
        italic: true,
        underline: false,
        strike: false,
        code: false,
        link: null,
      },
      {
        text: 'U',
        bold: false,
        italic: false,
        underline: true,
        strike: false,
        code: false,
        link: null,
      },
      {
        text: 'S',
        bold: false,
        italic: false,
        underline: false,
        strike: true,
        code: false,
        link: null,
      },
      {
        text: 'C',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        code: true,
        link: null,
      },
      {
        text: 'L',
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        code: false,
        link: { url: 'h', target: '_self' },
      },
    ])
  })

  it('lists flatten to paragraphs with bullet/number prefixes', () => {
    const out = convertTiptapToPayload({
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'X' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Y' }] }],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }],
            },
          ],
        },
      ],
    })

    const texts = out.map((p: any) => p.children?.[0]?.text)
    expect(texts).toEqual(['• X', '• Y', '1. A', '2. B'])
  })
})
