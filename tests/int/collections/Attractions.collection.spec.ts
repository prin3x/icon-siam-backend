import { describe, it, expect } from 'vitest'
import { Attractions } from '@/collections/Attractions'

function getFieldByName(name: string) {
  return (Attractions.fields as any[]).find((f) => f.name === name)
}

describe('Collection: Attractions', () => {
  it('has expected slug, admin, and read access', () => {
    expect(Attractions.slug).toBe('attractions')
    expect(Attractions.admin?.useAsTitle).toBe('title')
    expect(Attractions.admin?.defaultColumns).toEqual(['title', 'status', 'updatedAt'])
    // access.read is a function returning true
    expect(Attractions.access?.read && (Attractions.access.read as any)()).toBe(true)
  })

  it('defines status field with defaults and options', () => {
    const status = getFieldByName('status') as any
    expect(status.type).toBe('select')
    expect(status.defaultValue).toBe('ACTIVE')
    const values = status.options.map((o: any) => o.value)
    expect(values).toEqual(['ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED'])
  })

  it('uses ColorPicker for showcase_background_color and has default', () => {
    const color = getFieldByName('showcase_background_color') as any
    expect(color.defaultValue).toBe('#000000')
    expect(color.admin?.components?.Field).toBe('@/components/ColorPicker')
  })

  it('order beforeChange hook allows same value on update and prevents duplicates', async () => {
    const orderField = getFieldByName('order') as any
    const hook = orderField.hooks.beforeChange[0]

    // same value on update
    const same = await hook({
      data: { order: 10 },
      req: { payload: { find: async () => ({ docs: [] }) } },
      value: 10,
      originalDoc: { order: 10 },
      operation: 'update',
    })
    expect(same).toBe(10)

    // duplicate detection
    await expect(
      hook({
        data: { order: 5 },
        req: { payload: { find: async () => ({ docs: [{ id: 1 }] }) } },
        value: 5,
        originalDoc: { order: 1 },
        operation: 'create',
      }),
    ).rejects.toThrow('Order already exists')
  })
})
