import { describe, it, expect } from 'vitest'
import { Footers } from '@/collections/Footers'

describe('Collection: Footers', () => {
  it('has slug and admin defaults', () => {
    expect(Footers.slug).toBe('footers')
    expect(Footers.admin?.useAsTitle).toBe('name')
    expect(Footers.admin?.defaultColumns).toEqual(['name', 'connect_with_us', 'awards', 'status'])
  })

  it('connect_with_us items include upload and link', () => {
    const connect = (Footers.fields as any[]).find((f) => f.name === 'connect_with_us')
    const image = connect.fields.find((f: any) => f.name === 'image_icon')
    const link = connect.fields.find((f: any) => f.name === 'link')
    expect(image.type).toBe('upload')
    expect(image.relationTo).toBe('media')
    expect(link.type).toBe('text')
  })

  it('awards array includes media upload', () => {
    const awards = (Footers.fields as any[]).find((f) => f.name === 'awards')
    const img = awards.fields.find((f: any) => f.name === 'image_url')
    expect(img.type).toBe('upload')
    expect(img.relationTo).toBe('media')
  })
})
