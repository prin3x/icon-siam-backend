import { describe, it, expect } from 'vitest'
import { GettingHere } from '@/collections/GettingHere'

describe('Collection: GettingHere', () => {
  it('has slug and admin defaults', () => {
    expect(GettingHere.slug).toBe('getting-here')
    expect(GettingHere.admin?.useAsTitle).toBe('title')
    expect(GettingHere.admin?.defaultColumns).toEqual([
      'title',
      'location',
      'contact',
      'contact_info',
      'status',
    ])
  })

  it('title field has default value and localized', () => {
    const title = (GettingHere.fields as any[]).find((f) => f.name === 'title')
    expect(title.defaultValue).toBe('Getting Here')
    expect(title.localized).toBe(true)
  })

  it('opening_hours.per_day has conditional and day options', () => {
    const opening = (GettingHere.fields as any[]).find((f) => f.name === 'opening_hours')
    const perDay = opening.fields.find((f: any) => f.name === 'per_day')
    expect(typeof perDay.admin.condition).toBe('function')
    const day = perDay.fields.find((f: any) => f.name === 'day')
    const values = day.options.map((o: any) => o.value)
    expect(values).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
  })

  it('explore_icon_siam placement_key contains known options', () => {
    const explore = (GettingHere.fields as any[]).find((f) => f.name === 'explore_icon_siam')
    const placement = explore.fields.find((f: any) => f.name === 'placement_key')
    const values = placement.options.map((o: any) => o.value)
    expect(values).toContain('HOMEPAGE')
    expect(values).toContain('ABOUT')
    expect(values).toContain('EVENTS')
  })
})
