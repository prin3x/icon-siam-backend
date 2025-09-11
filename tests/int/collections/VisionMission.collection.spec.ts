import { describe, it, expect } from 'vitest'
import { VisionMission } from '@/collections/VisionMission'

describe('Collection: VisionMission', () => {
  it('has slug and admin defaults', () => {
    expect(VisionMission.slug).toBe('vision-mission')
    expect(VisionMission.admin?.useAsTitle).toBe('title')
    expect(VisionMission.admin?.defaultColumns).toEqual(['title', 'status', 'sort_order'])
  })

  it('title default value is set', () => {
    const title = (VisionMission.fields as any[]).find((f) => f.name === 'title')
    expect(title.defaultValue).toBe('VISION AND MISSION')
  })

  it('content_sections include text, richText, and upload fields', () => {
    const sections = (VisionMission.fields as any[]).find((f) => f.name === 'content_sections')
    const hasTitle = sections.fields.find((f: any) => f.name === 'title')
    const hasDesc = sections.fields.find((f: any) => f.name === 'description')
    const hasImage = sections.fields.find((f: any) => f.name === 'image')
    expect(hasTitle.type).toBe('text')
    expect(hasDesc.type).toBe('richText')
    expect(hasImage.type).toBe('upload')
  })
})
