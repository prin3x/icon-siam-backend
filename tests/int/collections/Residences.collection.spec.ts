import { describe, it, expect } from 'vitest'
import { Residences } from '@/collections/Residences'

describe('Collection: Residences', () => {
  it('has slug and admin defaults', () => {
    expect(Residences.slug).toBe('residences')
    expect(Residences.admin?.useAsTitle).toBe('title')
    expect(Residences.admin?.defaultColumns).toEqual(['title', 'status', 'sort_order'])
  })

  it('title default value is set and required', () => {
    const title = (Residences.fields as any[]).find((f) => f.name === 'title')
    expect(title.defaultValue).toBe('RESIDENCES')
    expect(title.required).toBe(true)
  })

  it('gallery.images enforces maxRows and required upload', () => {
    const gallery = (Residences.fields as any[]).find((f) => f.name === 'gallery')
    const images = gallery.fields.find((f: any) => f.name === 'images')
    expect(images.maxRows).toBe(4)
    const imageField = images.fields.find((f: any) => f.name === 'image')
    expect(imageField.required).toBe(true)
  })
})
