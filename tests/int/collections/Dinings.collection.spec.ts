import { describe, it, expect } from 'vitest'
import { Dinings } from '@/collections/Dinings'

describe('Collection: Dinings', () => {
  it('has slug and admin defaults', () => {
    expect(Dinings.slug).toBe('dinings')
    expect(Dinings.admin?.useAsTitle).toBe('title')
    expect(Dinings.admin?.defaultColumns).toEqual(['title', 'status', 'updatedAt'])
  })

  it('categories field filters to dinings and active', () => {
    const categories = (Dinings.fields as any[]).find((f) => f.name === 'categories')
    expect(categories.relationTo).toBe('categories')
    expect(categories.hasMany).toBe(true)
    expect(categories.filterOptions.type.equals).toBe('dinings')
    expect(categories.filterOptions.status.equals).toBe('ACTIVE')
  })

  it('location_zone uses custom LocationZonePicker component', () => {
    const field = (Dinings.fields as any[]).find((f) => f.name === 'location_zone')
    expect(field.admin?.components?.Field).toBe('@/components/LocationZonePicker')
  })

  it('opening_hours has conditional per_day based on same_hours_every_day', () => {
    const opening = (Dinings.fields as any[]).find((f) => f.name === 'opening_hours')
    const perDay = opening.fields.find((f: any) => f.name === 'per_day')
    expect(typeof perDay.admin.condition).toBe('function')
  })
})
