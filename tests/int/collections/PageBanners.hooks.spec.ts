import { describe, it, expect } from 'vitest'
import { PageBanners } from '@/collections/PageBanners'

describe('PageBanners hooks', () => {
  it('returns value when no originalDoc.section_config', async () => {
    const section = (PageBanners.fields || []).find((f: any) => f.name === 'config') as any
    const sectionConfig = section.fields.find((f: any) => f.name === 'section_config')
    const hook = sectionConfig.hooks.beforeChange[0]

    const value = [{ id: 'a', name: 'Related Section', key: 'RELATED_SECTION', status: true }]
    const result = await hook({ value, originalDoc: {} })
    expect(result).toEqual(value)
  })

  it('merges by id preserving previous items', async () => {
    const section = (PageBanners.fields || []).find((f: any) => f.name === 'config') as any
    const sectionConfig = section.fields.find((f: any) => f.name === 'section_config')
    const hook = sectionConfig.hooks.beforeChange[0]

    const originalDoc = {
      section_config: [
        { id: 'a', name: 'Related Section', key: 'RELATED_SECTION', status: true },
        { id: 'b', name: 'Another', key: 'ANOTHER', status: false },
      ],
    }
    const value = [{ id: 'a', name: 'Related Section', key: 'RELATED_SECTION', status: false }]

    const result = await hook({ value, originalDoc })
    // should merge: keep updated a, preserve b
    expect(result).toEqual([
      { id: 'a', name: 'Related Section', key: 'RELATED_SECTION', status: false },
      { id: 'b', name: 'Another', key: 'ANOTHER', status: false },
    ])
  })
})
