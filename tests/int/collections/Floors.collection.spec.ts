import { describe, it, expect } from 'vitest'
import { Floors } from '@/collections/Floors'

describe('Collection: Floors', () => {
  it('has slug and admin defaults', () => {
    expect(Floors.slug).toBe('floors')
    expect(Floors.admin?.useAsTitle).toBe('name')
    expect(Floors.admin?.defaultColumns).toEqual(['name', 'order', 'status'])
  })

  it('fields include name required and status defaults', () => {
    const name = (Floors.fields as any[]).find((f) => f.name === 'name')
    expect(name.required).toBe(true)

    const order = (Floors.fields as any[]).find((f) => f.name === 'order')
    expect(order.required).toBe(true)
    expect(order.defaultValue).toBe(1)

    const status = (Floors.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('ACTIVE')
  })
})
