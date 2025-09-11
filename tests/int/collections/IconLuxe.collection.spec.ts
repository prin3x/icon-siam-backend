import { describe, it, expect } from 'vitest'
import { IconLuxe } from '@/collections/IconLuxe'

describe('Collection: IconLuxe', () => {
  it('has slug and admin defaults', () => {
    expect(IconLuxe.slug).toBe('icon-luxe')
    expect(IconLuxe.admin?.useAsTitle).toBe('title')
    expect(IconLuxe.admin?.defaultColumns).toEqual(['title', 'status'])
  })

  it('slug field is unique and required', () => {
    const slug = (IconLuxe.fields as any[]).find((f) => f.name === 'slug')
    expect(slug.unique).toBe(true)
    expect(slug.required).toBe(true)
  })
})
