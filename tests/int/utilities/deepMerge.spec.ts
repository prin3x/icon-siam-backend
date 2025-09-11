import { describe, it, expect } from 'vitest'
import deepMerge, { isObject } from '@/utilities/deepMerge'

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns false for arrays and null', () => {
    expect(isObject([1, 2, 3] as any)).toBe(false)
    expect(isObject(null as any)).toBe(false)
  })
})

describe('deepMerge', () => {
  it('isObject identifies plain objects only', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject('x')).toBe(false)
  })

  it('merges nested objects', () => {
    const a = { a: 1, nested: { x: 1, y: { z: 1 } } }
    const b = { b: 2, nested: { y: { z: 2, w: 3 }, k: 4 } }
    const result = deepMerge(a, b) as any
    expect(result).toEqual({ a: 1, b: 2, nested: { x: 1, y: { z: 2, w: 3 }, k: 4 } })
    // Ensure original not mutated
    expect(a.nested.y.z).toBe(1)
  })

  it('returns source if target is not object', () => {
    expect(deepMerge(5 as unknown as any, { x: 1 })).toEqual({ x: 1 })
    expect(deepMerge('a' as unknown as any, { x: 1 })).toEqual({ x: 1 })
  })

  it('assigns non-object values directly including arrays', () => {
    const a = { list: [1, 2], val: 1 }
    const b = { list: [3], val: 2 }
    const result = deepMerge(a, b) as any
    expect(result.list).toEqual([3])
    expect(result.val).toBe(2)
  })
})
