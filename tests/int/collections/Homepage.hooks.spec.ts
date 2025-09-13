import { describe, it, expect } from 'vitest'
import { Homepage } from '@/collections/Homepage'

describe('Homepage hooks', () => {
  it('allows publishing when no other published exists', async () => {
    const hook = Homepage.hooks?.beforeChange?.[0] as any
    const req = {
      payload: {
        find: async () => ({ docs: [] }),
      },
    }
    const data = { id: '1', status: 'published' }
    const result = await hook({ data, req, operation: 'create' })
    expect(result).toEqual(data)
  })

  it('throws when another published exists', async () => {
    const hook = Homepage.hooks?.beforeChange?.[0] as any
    const req = {
      payload: {
        find: async () => ({ docs: [{ id: 'other' }] }),
      },
    }
    const data = { id: '1', status: 'published' }
    await expect(hook({ data, req, operation: 'create' })).rejects.toThrow(
      'Only one homepage can be published at a time.',
    )
  })

  it('allows update when same published id is found', async () => {
    const hook = Homepage.hooks?.beforeChange?.[0] as any
    const req = {
      payload: {
        find: async () => ({ docs: [{ id: '1' }] }),
      },
    }
    const data = { id: '1', status: 'published' }
    const result = await hook({ data, req, operation: 'update' })
    expect(result).toEqual(data)
  })
})
