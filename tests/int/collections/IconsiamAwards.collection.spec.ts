import { describe, it, expect } from 'vitest'
import { IconsiamAwards } from '@/collections/IconsiamAwards'

describe('Collection: IconsiamAwards', () => {
  it('has slug and admin defaults', () => {
    expect(IconsiamAwards.slug).toBe('iconsiam-awards')
    expect(IconsiamAwards.admin?.useAsTitle).toBe('title')
    expect(IconsiamAwards.admin?.defaultColumns).toEqual(['title', 'status', 'sort_order'])
  })

  it('defaults exist on title and description', () => {
    const title = (IconsiamAwards.fields as any[]).find((f) => f.name === 'title')
    const desc = (IconsiamAwards.fields as any[]).find((f) => f.name === 'description')
    expect(title.defaultValue).toBe('ICONSIAM AWARDS')
    expect(desc.defaultValue).toBeTruthy()
  })

  it('featured_awards array is hidden and has required fields', () => {
    const fa = (IconsiamAwards.fields as any[]).find((f) => f.name === 'featured_awards')
    expect(fa.hidden).toBe(true)
    const image = fa.fields.find((f: any) => f.name === 'award_image')
    const awardTitle = fa.fields.find((f: any) => f.name === 'award_title')
    expect(image.required).toBe(true)
    expect(awardTitle.required).toBe(true)
  })
})
