import { describe, it, expect } from 'vitest'
import { ApiSyncLogs } from '@/collections/ApiSyncLogs'

describe('Collection: ApiSyncLogs', () => {
  it('has slug and admin description', () => {
    expect(ApiSyncLogs.slug).toBe('api-sync-logs')
    expect(ApiSyncLogs.admin?.description).toContain('Track external API sync operations')
  })

  it('status defaults to RUNNING', () => {
    const status = (ApiSyncLogs.fields as any[]).find((f) => f.name === 'status')
    expect(status.defaultValue).toBe('RUNNING')
  })

  it('beforeChange calculates duration when both dates present', async () => {
    const hook = ApiSyncLogs.hooks?.beforeChange?.[0] as any
    const data = {
      started_at: '2024-01-01T00:00:00.000Z',
      completed_at: '2024-01-01T00:00:20.000Z',
    }
    const out = await hook({ data })
    expect(out.duration_seconds).toBe(20)
  })
})
