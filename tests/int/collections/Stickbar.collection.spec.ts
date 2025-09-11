import { describe, it, expect } from 'vitest'
import { Stickbar } from '@/collections/Stickbar'

describe('Collection: Stickbar', () => {
  it('has slug and admin defaults', () => {
    expect(Stickbar.slug).toBe('stickbar')
    expect(Stickbar.admin?.defaultColumns).toEqual(['title', 'status', 'updatedAt'])
  })

  it('status defaults to active and is localized', () => {
    const status = (Stickbar.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('active')
    expect(status.localized).toBe(true)
  })

  it('background_color uses ColorPicker and default', () => {
    const bg = (Stickbar.fields as any[]).find((f) => f.name === 'background_color')
    expect(bg.defaultValue).toBe('#987b2c')
    expect(bg.admin?.components?.Field).toBe('@/components/ColorPicker')
  })
})
