import { describe, it, expect } from 'vitest'
import { GalleryCollections } from '@/collections/GalleryCollections'

describe('Collection: GalleryCollections', () => {
  it('has slug and admin defaults', () => {
    expect(GalleryCollections.slug).toBe('gallery-collections')
    expect(GalleryCollections.admin?.useAsTitle).toBe('placement_key')
    expect(GalleryCollections.admin?.defaultColumns).toEqual(['placement_key', 'title'])
  })

  it('placement_key select is required, unique, and has expected options', () => {
    const placement = (GalleryCollections.fields as any[]).find((f) => f.name === 'placement_key')
    expect(placement.required).toBe(true)
    expect(placement.unique).toBe(true)
    const values = placement.options.map((o: any) => o.value)
    expect(values).toContain('HOMEPAGE')
    expect(values).toContain('ABOUT')
    expect(values).toContain('EVENTS')
  })

  it('gallery_image_urls array includes upload to media', () => {
    const arr = (GalleryCollections.fields as any[]).find((f) => f.name === 'gallery_image_urls')
    const image = arr.fields.find((f: any) => f.name === 'image_url')
    expect(image.type).toBe('upload')
    expect(image.relationTo).toBe('media')
  })
})
