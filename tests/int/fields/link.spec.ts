import { describe, it, expect } from 'vitest'
import { link, appearanceOptions } from '@/fields/link'

describe('fields/link', () => {
  it('builds default link field with label and appearances', () => {
    const field = link()
    expect(field.type).toBe('group')
    const rows = (field as any).fields
    expect(Array.isArray(rows)).toBe(true)
    const hasLabel = JSON.stringify(rows).includes('Label')
    expect(hasLabel).toBe(true)
    const appearance = rows.find((f: any) => f.name === 'appearance')
    expect(appearance.options).toEqual([appearanceOptions.default, appearanceOptions.outline])
  })

  it('disables appearances when appearances=false', () => {
    const field = link({ appearances: false })
    const rows = (field as any).fields
    const hasAppearance = rows.some((f: any) => f.name === 'appearance')
    expect(hasAppearance).toBe(false)
  })

  it('customizes appearances subset', () => {
    const field = link({ appearances: ['outline'] })
    const appearance = (field as any).fields.find((f: any) => f.name === 'appearance')
    expect(appearance.options).toEqual([appearanceOptions.outline])
  })

  it('omits label when disableLabel=true', () => {
    const field = link({ disableLabel: true })
    const rows = (field as any).fields
    const withLabel = JSON.stringify(rows).includes('Label')
    expect(withLabel).toBe(false)
  })
})
