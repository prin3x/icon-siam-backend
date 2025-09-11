import { describe, it, expect } from 'vitest'
import { BoardOfDirectors } from '@/collections/BoardOfDirectors'

describe('Collection: BoardOfDirectors', () => {
  it('has slug and admin defaults', () => {
    expect(BoardOfDirectors.slug).toBe('board-of-directors')
    expect(BoardOfDirectors.admin?.useAsTitle).toBe('title')
    expect(BoardOfDirectors.admin?.defaultColumns).toEqual(['title', 'status', 'sort_order'])
  })

  it('title default and description default are present', () => {
    const title = (BoardOfDirectors.fields as any[]).find((f) => f.name === 'title')
    const description = (BoardOfDirectors.fields as any[]).find((f) => f.name === 'description')
    expect(title.defaultValue).toBe('BOARD OF DIRECTORS')
    expect(description.defaultValue).toBeTruthy()
  })

  it('directors array requires full_name and title, and includes profile_image upload', () => {
    const directors = (BoardOfDirectors.fields as any[]).find((f) => f.name === 'directors')
    const fullName = directors.fields.find((f: any) => f.name === 'full_name')
    const position = directors.fields.find((f: any) => f.name === 'title')
    const profile = directors.fields.find((f: any) => f.name === 'profile_image')
    expect(fullName.required).toBe(true)
    expect(position.required).toBe(true)
    expect(profile.type).toBe('upload')
    expect(profile.relationTo).toBe('media')
  })
})
