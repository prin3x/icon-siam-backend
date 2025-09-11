import { describe, it, expect } from 'vitest'
import { Categories } from '@/collections/Categories'

describe('Collection: Categories', () => {
  it('has slug and admin defaults', () => {
    expect(Categories.slug).toBe('categories')
    expect(Categories.admin?.useAsTitle).toBe('name')
    expect(Categories.admin?.defaultColumns).toEqual(['name', 'type', 'slug', 'status'])
  })

  it('read access is public', () => {
    expect(Categories.access?.read && (Categories.access.read as any)()).toBe(true)
  })

  it('defines required select fields and unique slug', () => {
    const fields: any[] = Categories.fields as any

    const type = fields.find((f) => f.name === 'type')
    expect(type.type).toBe('select')
    expect(type.required).toBe(true)
    const typeValues = type.options.map((o: any) => o.value)
    expect(typeValues).toContain('promotions')

    const status = fields.find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('ACTIVE')

    const slug = fields.find((f) => f.name === 'slug')
    expect(slug.required).toBe(true)
    expect(slug.unique).toBe(true)
  })
})
