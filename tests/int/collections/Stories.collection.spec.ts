import { describe, it, expect } from 'vitest'
import { Stories } from '@/collections/Stories'

describe('Collection: Stories', () => {
  it('has slug and admin defaults', () => {
    expect(Stories.slug).toBe('stories')
    expect(Stories.admin?.useAsTitle).toBe('title')
    expect(Stories.admin?.defaultColumns).toEqual(['title', 'start_date', 'end_date', 'status'])
  })

  it('videos group contains youtube_url config', () => {
    const videos = (Stories.fields as any[]).find((f) => f.name === 'videos')
    const youtube = videos.fields.find((f: any) => f.name === 'youtube_url')
    expect(youtube.type).toBe('text')
    expect(youtube.localized).toBe(true)
  })

  it('relationships filter categories by type=stories and status=ACTIVE', () => {
    const relationships = (Stories.fields as any[]).find((f) => f.name === 'relationships')
    const categories = relationships.fields.find((f: any) => f.name === 'categories')
    expect(categories.filterOptions.type.equals).toBe('stories')
    expect(categories.filterOptions.status.equals).toBe('ACTIVE')
  })
})
