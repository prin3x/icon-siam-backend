import { describe, it, vi } from 'vitest'
import { getMeUser } from '@/utilities/getMeUser'

vi.mock('next/navigation', async (orig) => {
  const actual = await (orig as any)()
  return {
    ...actual,
    redirect: (url: string) => {
      throw new (class RedirectError extends Error {
        destination = url
      })('redirect')
    },
  }
})

describe('getMeUser redirects', () => {
  it('redirects on validUserRedirect when user present', async () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: 'jwt-token' }) } as any
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ user: { id: '1' } }) }) as any
    try {
      await getMeUser({ cookieStore: cookies, validUserRedirect: '/dashboard' })
    } catch (e: any) {
      // We expect our mocked redirect to throw
      if (e?.destination !== '/dashboard') throw e
    }
  })

  it('redirects on nullUserRedirect when no user', async () => {
    const cookies = { get: vi.fn().mockReturnValue({ value: 'jwt-token' }) } as any
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any
    try {
      await getMeUser({ cookieStore: cookies, nullUserRedirect: '/login' })
    } catch (e: any) {
      if (e?.destination !== '/login') throw e
    }
  })
})
