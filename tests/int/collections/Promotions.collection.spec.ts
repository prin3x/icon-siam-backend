import { describe, it, expect } from 'vitest'
import { Promotions } from '@/collections/Promotions'

describe('Collection: Promotions', () => {
  it('has slug and admin defaults', () => {
    expect(Promotions.slug).toBe('promotions')
    expect(Promotions.admin?.useAsTitle).toBe('title')
    expect(Promotions.admin?.defaultColumns).toEqual(['title', 'start_date', 'end_date', 'status'])
    expect(Promotions.access?.read && (Promotions.access.read as any)()).toBe(true)
  })

  it('status field has default and options', () => {
    const status = (Promotions.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('ACTIVE')
    const values = status.options.map((o: any) => o.value)
    expect(values).toEqual(['ACTIVE', 'INACTIVE'])
  })

  it('relationships group defines filtered categories and related content', () => {
    const relationships = (Promotions.fields as any[]).find((f) => f.name === 'relationships')
    const cats = relationships.fields.find((f: any) => f.name === 'categories')
    expect(cats.relationTo).toBe('categories')
    expect(cats.hasMany).toBe(true)
    expect(cats.filterOptions.type.equals).toBe('promotions')

    const related = relationships.fields.find((f: any) => f.name === 'related_content')
    expect(related.relationTo).toEqual(['dinings', 'shops', 'attractions', 'events'])
    expect(related.hasMany).toBe(true)
  })
})
