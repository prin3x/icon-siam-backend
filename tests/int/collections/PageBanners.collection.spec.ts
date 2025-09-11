import { describe, it, expect } from 'vitest'
import { PageBanners } from '@/collections/PageBanners'

describe('Collection: PageBanners', () => {
  it('has slug and admin config', () => {
    expect(PageBanners.slug).toBe('page-banners')
    expect(PageBanners.admin?.useAsTitle).toBe('custom_title')
    expect(PageBanners.admin?.defaultColumns).toEqual(['placement_key', 'status'])
  })

  it('placement_key select is required, unique, with expected options', () => {
    const placement = (PageBanners.fields as any[]).find((f) => f.name === 'placement_key')
    expect(placement.required).toBe(true)
    expect(placement.unique).toBe(true)
    const values = placement.options.map((o: any) => o.value)
    expect(values).toContain('HOMEPAGE')
    expect(values).toContain('ABOUT')
    expect(values).toContain('EVENTS')
    expect(values).toContain('PROMOTIONS')
  })

  it('section_config beforeChange preserves old items when not provided', async () => {
    const configGroup = (PageBanners.fields as any[]).find((f) => f.name === 'config')
    const section = configGroup.fields.find((f: any) => f.name === 'section_config')
    const hook = section.hooks.beforeChange[0]

    const originalDoc = { section_config: [{ id: 'a', name: 'X', key: 'K', status: true }] }
    const value = [{ id: 'b', name: 'Y', key: 'J', status: false }]

    const out = await hook({ value, originalDoc })
    // Existing item a preserved because no matching id provided
    const ids = out.map((v: any) => v.id)
    expect(ids).toContain('a')
  })
})
