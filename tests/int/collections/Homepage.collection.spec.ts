import { describe, it, expect } from 'vitest'
import { Homepage } from '@/collections/Homepage'

describe('Collection: Homepage', () => {
  it('has slug and admin defaults', () => {
    expect(Homepage.slug).toBe('homepage')
    expect(Homepage.admin?.useAsTitle).toBe('title')
    expect(Homepage.admin?.defaultColumns).toEqual(['title', 'subtitle', 'status'])
    expect(Homepage.access?.read && (Homepage.access.read as any)()).toBe(true)
  })

  it('color picker field configured and defaulted', () => {
    const color = (Homepage.fields as any[]).find(
      (f) => f.name === 'onesiam_animation_text_runner_color',
    )
    expect(color.defaultValue).toBe('#ffffff')
    expect(color.admin?.components?.Field).toBe('@/components/ColorPicker')
  })

  it('beforeChange hook prevents multiple published homepages', async () => {
    const hook = Homepage.hooks?.beforeChange?.[0] as any

    await expect(
      hook({
        data: { status: 'published', id: '2' },
        req: {
          payload: {
            find: async () => ({ docs: [{ id: '1' }] }),
          },
        },
        operation: 'create',
      }),
    ).rejects.toThrow('Only one homepage can be published at a time.')

    // ok when no other published exists
    const ok = await hook({
      data: { status: 'published', id: '2' },
      req: {
        payload: {
          find: async () => ({ docs: [] }),
        },
      },
      operation: 'create',
    })
    expect(ok.status).toBe('published')
  })
})
