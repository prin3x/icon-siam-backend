import { describe, it, expect } from 'vitest'
import { Directory } from '@/collections/Directory'

describe('Collection: Directory', () => {
  it('has slug and admin default columns', () => {
    expect(Directory.slug).toBe('directory')
    expect(Directory.admin?.defaultColumns).toEqual(['icon_siam_picks'])
  })

  it('icon_siam_picks.item supports expected relationTo and is required', () => {
    const arr = (Directory.fields as any[]).find((f) => f.name === 'icon_siam_picks')
    const item = arr.fields.find((f: any) => f.name === 'item')
    expect(item.relationTo).toEqual(['shops', 'dinings', 'attractions', 'icon-luxe', 'icon-craft'])
    expect(item.hasMany).toBe(true)
    expect(item.required).toBe(true)
  })
})
