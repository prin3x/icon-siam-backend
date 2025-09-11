import { describe, it, expect } from 'vitest'
import { shouldHideField } from '@/utilities/fieldDisplay'

describe('fieldDisplay.shouldHideField', () => {
  it('hides when field object has hidden true', () => {
    expect(shouldHideField({ name: 'anything', hidden: true })).toBe(true)
  })

  it('hides common system fields by name (case insensitive)', () => {
    const names = [
      'id',
      'createdAt',
      'updatedAt',
      'created_at',
      'updated_at',
      '_status',
      'unique_id',
    ]
    for (const n of names) {
      expect(shouldHideField(n)).toBe(true)
    }
  })

  it('does not hide other names', () => {
    expect(shouldHideField('title')).toBe(false)
    expect(shouldHideField({ name: 'description' } as any)).toBe(false)
  })
})
