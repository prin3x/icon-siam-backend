import { describe, it, expect } from 'vitest'
import {
  buildDefaultLayout,
  getLayoutForCollection,
  FORM_LAYOUTS,
} from '@/components/admin/formLayouts'

describe('formLayouts', () => {
  it('buildDefaultLayout groups fields into sections and sets columns when right exists', () => {
    const fields = [
      { name: 'status', type: 'text' },
      { name: 'slug', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'description', type: 'textarea' },
      { name: 'blurb', type: 'text' },
      { name: 'image_banner', type: 'upload' },
      { name: 'related_content', type: 'relationship' },
      { name: 'custom_group', type: 'group' },
      { name: 'other_count', type: 'number' },
    ] as any

    const layout = buildDefaultLayout('any', fields)

    expect(layout.columns).toBe(2)
    const rightTitles = (layout.right || []).map((s) => s.title)
    expect(rightTitles).toContain('Status')
    expect(rightTitles).toContain('SEO Setting')

    const leftTitles = layout.left.map((s) => s.title)
    expect(leftTitles).toContain('Basic Info')
    expect(leftTitles).toContain('Content')
    expect(leftTitles).toContain('Media')
    expect(leftTitles).toContain('Relationships')
    expect(leftTitles).toContain('Custom Group')
    expect(leftTitles).toContain('Other Fields')
  })

  it('getLayoutForCollection returns pre-defined layout for known collection', () => {
    expect(FORM_LAYOUTS.homepage).toBeTruthy()
    const layout = getLayoutForCollection('homepage', [] as any)
    expect(layout).toEqual(FORM_LAYOUTS.homepage)
  })

  it('getLayoutForCollection returns undefined when no fields provided and no preset', () => {
    const layout = getLayoutForCollection('unknown', [] as any)
    expect(layout).toBeUndefined()
  })
})
