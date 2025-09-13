import { describe, it, expect } from 'vitest'
import { linkGroup } from '@/fields/linkGroup'

describe('fields/linkGroup', () => {
  it('builds array field with link item', () => {
    const field: any = linkGroup()
    expect(field.type).toBe('array')
    expect(field.fields?.[0]?.type).toBe('group')
    expect(field.admin?.initCollapsed).toBe(true)
  })

  it('merges overrides', () => {
    const field: any = linkGroup({
      overrides: { name: 'myLinks', admin: { initCollapsed: false } },
    })
    expect(field.name).toBe('myLinks')
    expect(field.admin.initCollapsed).toBe(false)
  })
})
