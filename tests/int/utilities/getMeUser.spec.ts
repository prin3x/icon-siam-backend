import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getMeUser } from '@/utilities/getMeUser'

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'token-123' }) }),
}))

const redirectMock = vi.fn()
vi.mock('next/navigation', () => ({ redirect: (...args: any[]) => redirectMock(...args) }))

const ORIGINAL_ENV = { ...process.env }

describe('getMeUser', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
    redirectMock.mockReset()
    // @ts-ignore
    global.fetch = vi.fn()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('returns token and user when fetch ok without redirect', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u1' } }),
    })
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'

    const res = await getMeUser()
    expect(res.token).toBe('token-123')
    expect(res.user).toEqual({ id: 'u1' })
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it('redirects to validUserRedirect when user present', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u1' } }),
    })
    await getMeUser({ validUserRedirect: '/dashboard' })
    expect(redirectMock).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to nullUserRedirect when user missing', async () => {
    ;(global.fetch as any).mockResolvedValue({ ok: false })
    await getMeUser({ nullUserRedirect: '/login' })
    expect(redirectMock).toHaveBeenCalledWith('/login')
  })

  it('uses provided cookieStore if passed', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u2' } }),
    })
    const res = await getMeUser({ cookieStore: { get: () => ({ value: 'custom-token' }) } as any })
    expect(res.token).toBe('custom-token')
  })
})
