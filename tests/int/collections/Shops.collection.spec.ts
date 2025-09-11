import { describe, it, expect } from 'vitest'
import { Shops } from '@/collections/Shops'

describe('Collection: Shops', () => {
  it('has slug and admin defaults', () => {
    expect(Shops.slug).toBe('shops')
    expect(Shops.admin?.useAsTitle).toBe('title')
    expect(Shops.admin?.defaultColumns).toEqual(['title', 'status', 'updatedAt'])
  })

  it('categories field filters to shops and active', () => {
    const categories = (Shops.fields as any[]).find((f) => f.name === 'categories')
    expect(categories.relationTo).toBe('categories')
    expect(categories.hasMany).toBe(true)
    expect(categories.filterOptions.type.equals).toBe('shops')
    expect(categories.filterOptions.status.equals).toBe('ACTIVE')
  })

  it('location_zone uses custom LocationZonePicker component', () => {
    const field = (Shops.fields as any[]).find((f) => f.name === 'location_zone')
    expect(field.admin?.components?.Field).toBe('@/components/LocationZonePicker')
  })

  it('status field has expected options including COMING_SOON and MASTER', () => {
    const status = (Shops.fields as any[]).find((f) => f.name === 'status')
    const values = status.options.map((o: any) => o.value)
    expect(values).toEqual([
      'ACTIVE',
      'INACTIVE',
      'CLOSED',
      'TEMPORARILY_CLOSED',
      'COMING_SOON',
      'MASTER',
    ])
  })
})
