import { describe, it, expect, vi } from 'vitest'
import { navigateWithLocale } from '@/utilities/navigation'

describe('navigateWithLocale', () => {
  it('appends locale to query and pushes', () => {
    const push = vi.fn()
    const router = { push } as any
    const original = globalThis.window?.location?.origin || 'http://localhost'
    Object.defineProperty(window, 'location', {
      value: new URL(original),
      writable: true,
    })

    navigateWithLocale(router, '/admin', 'th')

    expect(push).toHaveBeenCalledWith('/admin?locale=th')
  })
})
