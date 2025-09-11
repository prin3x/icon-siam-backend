import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Media } from '@/collections/Media'

const ORIGINAL_ENV = { ...process.env }

describe('Collection: Media', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('has slug and admin config', () => {
    expect(Media.slug).toBe('media')
    expect(Media.admin?.group).toBe('Content')
    expect(Media.admin?.defaultColumns).toEqual(['filename', 'createdAt'])
  })

  it('upload config respects UPLOAD_STRATEGY env', async () => {
    // default true
    expect(Media.upload).toBe(true)

    // when local
    process.env.UPLOAD_STRATEGY = 'local'
    vi.resetModules()
    const { Media: LocalMedia } = await import('@/collections/Media')
    expect((LocalMedia.upload as any).staticDir).toBe('media')
  })

  it('alt group has i18n fields', () => {
    const alt = (Media.fields as any[]).find((f) => f.name === 'alt')
    const names = alt.fields.map((f: any) => f.name)
    expect(names).toEqual(['en', 'th', 'zh'])
  })
})
