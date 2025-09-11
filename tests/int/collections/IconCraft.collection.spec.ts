import { describe, it, expect } from 'vitest'
import { IconCraft } from '@/collections/IconCraft'

describe('Collection: IconCraft', () => {
  it('has slug and admin defaults', () => {
    expect(IconCraft.slug).toBe('icon-craft')
    expect(IconCraft.admin?.useAsTitle).toBe('title')
    expect(IconCraft.admin?.defaultColumns).toEqual(['title', 'status'])
  })

  it('content arrays include upload fields and localized', () => {
    const content = (IconCraft.fields as any[]).find((f) => f.name === 'content')
    expect(content.localized).toBe(true)
    const upload = content.fields.find((f: any) => f.name === 'image_url')
    expect(upload.type).toBe('upload')
    expect(upload.relationTo).toBe('media')
  })

  it('slug field is unique and required', () => {
    const slug = (IconCraft.fields as any[]).find((f) => f.name === 'slug')
    expect(slug.unique).toBe(true)
    expect(slug.required).toBe(true)
  })
})
