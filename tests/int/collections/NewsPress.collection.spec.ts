import { describe, it, expect } from 'vitest'
import { NewsPress } from '@/collections/NewsPress'

describe('Collection: NewsPress', () => {
  it('has slug and admin defaults (hidden)', () => {
    expect(NewsPress.slug).toBe('news-press')
    expect(NewsPress.admin?.useAsTitle).toBe('title')
    expect(NewsPress.admin?.defaultColumns).toEqual(['title', 'start_date', 'end_date', 'status'])
    expect(NewsPress.admin?.hidden).toBe(true)
  })

  it('content uses lexical editor and has localized', () => {
    const content = (NewsPress.fields as any[]).find((f) => f.name === 'content')
    expect(content.type).toBe('richText')
    expect(content.localized).toBe(true)
    expect(typeof content.editor).toBe('function')
  })

  it('relationships include categories and related_content across collections', () => {
    const relationships = (NewsPress.fields as any[]).find((f) => f.name === 'relationships')
    const categories = relationships.fields.find((f: any) => f.name === 'categories')
    expect(categories.relationTo).toBe('categories')

    const related = relationships.fields.find((f: any) => f.name === 'related_content')
    expect(related.relationTo).toEqual(['dinings', 'shops', 'attractions', 'events', 'promotions'])
    expect(related.hasMany).toBe(true)
  })
})
