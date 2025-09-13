import { describe, it, expect } from 'vitest'
import { formatSlug, formatSlugHook } from '@/fields/slug/formatSlug'

describe('formatSlug', () => {
  it('transliterates and normalizes spaces/punctuation', () => {
    expect(formatSlug('Hello World')).toBe('hello-world')
    expect(formatSlug('Café — Déjà vu!')).toBe('cafe-deja-vu')
    expect(formatSlug('  trim  me  ')).toBe('trim-me')
    expect(formatSlug('A__B')).toBe('a__b')
  })

  it('returns empty for falsy', () => {
    // @ts-expect-error
    expect(formatSlug(undefined)).toBe('')
    expect(formatSlug('')).toBe('')
  })
})

describe('formatSlugHook', () => {
  it('respects user-provided slug and formats it', () => {
    const hook = formatSlugHook('title')
    const result = hook({ data: { title: 'Ignored' } as any, operation: 'create', value: 'My Slug!' } as any)
    expect(result).toBe('my-slug')
  })

  it('generates from fallback on create when slug is empty', () => {
    const hook = formatSlugHook('title')
    const result = hook({ data: { title: 'Hello World' } as any, operation: 'create', value: '' } as any)
    expect(result).toBe('hello-world')
  })

  it('generates from fallback on update when slug missing and data empty', () => {
    const hook = formatSlugHook('name')
    const result = hook({ data: { name: 'Café Déjà' } as any, operation: 'update', value: undefined } as any)
    expect(result).toBe('cafe-deja')
  })

  it('keeps value if nothing to generate', () => {
    const hook = formatSlugHook('title')
    const result = hook({ data: {}, operation: 'update', value: 'existing' } as any)
    expect(result).toBe('existing')
  })
})
