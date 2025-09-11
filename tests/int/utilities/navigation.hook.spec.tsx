import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

import { useNavigationWithLocale } from '@/utilities/navigation'

describe('useNavigationWithLocale', () => {
  it('push and pushWithoutLocale call router.push with expected args', () => {
    push.mockReset()

    const { result } = renderHook(() => useNavigationWithLocale())

    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost'),
      writable: true,
      configurable: true,
    })

    result.current.push('/admin', 'en')
    expect(push).toHaveBeenCalledWith('/admin?locale=en')

    result.current.pushWithoutLocale('/plain')
    expect(push).toHaveBeenCalledWith('/plain')
  })
})
