import { describe, it, expect } from 'vitest'
import { AboutIconsiam } from '@/collections/AboutICONSIAM'

describe('Collection: AboutIconsiam', () => {
  it('has slug and admin defaults', () => {
    expect(AboutIconsiam.slug).toBe('about-iconsiam')
    expect(AboutIconsiam.admin?.useAsTitle).toBe('title')
    expect(AboutIconsiam.admin?.defaultColumns).toEqual(['title', 'status', 'sort_order'])
  })

  it('status field defaults to ACTIVE', () => {
    const status = (AboutIconsiam.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('ACTIVE')
  })

  it('vision_mission.background_color has default and uses ColorPicker', () => {
    const vm = (AboutIconsiam.fields as any[]).find((f) => f.name === 'vision_mission')
    const bg = vm.fields.find((f: any) => f.name === 'background_color')
    expect(bg.defaultValue).toBe('#2B2B28')
    expect(bg.admin?.components?.Field).toBe('@/components/ColorPicker')
  })
})
