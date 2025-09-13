import { describe, it, expect } from 'vitest'
import { tiptapField } from '@/fields/tiptap'

describe('fields/tiptap', () => {
  it('returns richText field with RichTextEditor mapping', () => {
    const f: any = tiptapField()
    expect(f.type).toBe('richText')
    expect(f.admin?.components?.Field).toBe('RichTextEditor')
  })
})
