import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Users } from '@/collections/Users'

const ORIGINAL_ENV = { ...process.env }

describe('Collection: Users', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('has slug and admin defaults', () => {
    expect(Users.slug).toBe('users')
    expect(Users.admin?.useAsTitle).toBe('email')
    expect(Users.admin?.defaultColumns).toEqual(['email', 'createdAt'])
  })

  it('auth settings reflect env-secure cookies in production', async () => {
    process.env.NODE_ENV = 'production'
    vi.resetModules()
    const { Users: ProdUsers } = await import('@/collections/Users')
    expect(ProdUsers.auth?.cookies?.secure).toBe(true)
    expect(Users.auth?.cookies?.sameSite).toBe('Lax')
  })

  it('fields include email unique and roles defaults', () => {
    const fields: any[] = Users.fields as any
    const email = fields.find((f) => f.name === 'email')
    expect(email.type).toBe('email')
    expect(email.required).toBe(true)
    expect(email.unique).toBe(true)

    const roles = fields.find((f) => f.name === 'roles')
    expect(roles.type).toBe('select')
    expect(roles.hasMany).toBe(true)
    expect(roles.defaultValue).toEqual(['user'])
  })
})
