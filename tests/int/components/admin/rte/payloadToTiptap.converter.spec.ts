import { describe, it, expect } from 'vitest'
import { convertPayloadToTiptap } from '@/components/admin/rte/converters/payloadToTiptap'

describe('convertPayloadToTiptap', () => {
  it('returns empty doc for nullish', () => {
    expect(convertPayloadToTiptap(null)).toEqual({ type: 'doc', content: [] })
    expect(convertPayloadToTiptap(undefined as any)).toEqual({ type: 'doc', content: [] })
  })

  it('wraps string into paragraph', () => {
    const out = convertPayloadToTiptap('hello')
    expect(out.type).toBe('doc')
    expect(out.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'hello' }],
    })
  })

  it('returns same when already tiptap doc', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph' }] }
    expect(convertPayloadToTiptap(doc)).toBe(doc)
  })

  it('maps upload node to image with attrs', () => {
    const payload = [
      {
        type: 'upload',
        value: {
          id: '1',
          url: 'https://x/y.png',
          filename: 'alt',
          href: 'https://a',
          target: '_self',
        },
      },
    ]
    const out = convertPayloadToTiptap(payload)
    expect(out.content[0]).toEqual({
      type: 'image',
      attrs: {
        src: 'https://x/y.png',
        alt: 'alt',
        'data-id': '1',
        href: 'https://a',
        target: '_self',
      },
    })
  })

  it('horizontalRule and blockquote are preserved', () => {
    const payload = [
      { type: 'horizontalRule' },
      { type: 'blockquote', content: [{ type: 'paragraph' }] },
    ]
    const out = convertPayloadToTiptap(payload)
    expect(out.content[0]).toEqual({ type: 'horizontalRule' })
    expect(out.content[1]).toEqual({ type: 'blockquote', content: [{ type: 'paragraph' }] })
  })

  it('filters empty paragraph children and maps marks and link', () => {
    const payload = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          { text: 'Bold', bold: true },
          { text: ' Italic', italic: true },
          { text: ' Under', underline: true },
          { text: ' Strike', strike: true },
          { text: ' Code', code: true },
          { text: ' Link', link: { url: 'https://example.com', target: '_self' } },
        ],
        attrs: { textAlign: 'center' },
      },
    ]
    const out = convertPayloadToTiptap(payload)
    const para = out.content[0]
    expect(para.type).toBe('paragraph')
    expect(para.attrs.textAlign).toBe('center')
    const texts = para.content.map((n: any) => n.text).join('')
    expect(texts).toContain('Bold Italic Under Strike Code Link')
    const hasBold = para.content.some((n: any) => n.marks?.some((m: any) => m.type === 'bold'))
    const hasLink = para.content.some((n: any) => n.marks?.some((m: any) => m.type === 'link'))
    expect(hasBold).toBe(true)
    expect(hasLink).toBe(true)
  })

  it('produces empty paragraph for empty-only children', () => {
    const out = convertPayloadToTiptap([{ type: 'paragraph', children: [{ text: '' }] }])
    expect(out.content[0]).toEqual({ type: 'paragraph' })
  })
})
