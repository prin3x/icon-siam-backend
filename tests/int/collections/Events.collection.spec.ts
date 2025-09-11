import { describe, it, expect } from 'vitest'
import { Events } from '@/collections/Events'

describe('Collection: Events', () => {
  it('has slug and admin defaults', () => {
    expect(Events.slug).toBe('events')
    expect(Events.admin?.useAsTitle).toBe('title')
    expect(Events.admin?.defaultColumns).toEqual(['title', 'start_date', 'end_date', 'status'])
    expect(Events.access?.read && (Events.access.read as any)()).toBe(true)
  })

  it('status field defaults to ACTIVE', () => {
    const status = (Events.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('ACTIVE')
  })

  it('relationships.group includes filtered categories and related collections', () => {
    const relationships = (Events.fields as any[]).find((f) => f.name === 'relationships')
    const categories = relationships.fields.find((f: any) => f.name === 'categories')
    expect(categories.relationTo).toBe('categories')
    expect(categories.filterOptions.type.equals).toBe('events')

    const related = relationships.fields.find((f: any) => f.name === 'related_content')
    expect(related.relationTo).toEqual(['dinings', 'shops', 'attractions'])
  })

  it('promotion_type select has expected options', () => {
    const promotionType = (Events.fields as any[]).find((f) => f.name === 'promotion_type')
    const values = promotionType.options.map((o: any) => o.value)
    expect(values).toEqual(['none', 'special_offer', 'discount', 'event', 'sale'])
  })
})
