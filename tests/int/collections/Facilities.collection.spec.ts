import { describe, it, expect } from 'vitest'

import { Facilities } from '@/collections/Facilities'

describe('Facilities collection', () => {
  it('has correct slug and admin defaults', () => {
    expect(Facilities.slug).toBe('facilities')
    expect(Facilities.admin?.useAsTitle).toBe('title')
    expect(Facilities.admin?.defaultColumns).toEqual(['title'])
  })

  it('allows public read', () => {
    // access.read is a function that returns true
    // @ts-ignore
    expect(Facilities.access?.read?.()).toBe(true)
  })

  it('contains expected top-level fields', () => {
    const names = (Facilities.fields || []).map((f: any) => f.name)
    expect(names).toEqual([
      'title',
      'banner_image',
      'bank_section',
      'post_office_section',
      'services',
      'facilities',
    ])
  })

  it('validates group and array field structures', () => {
    const byName = Object.fromEntries((Facilities.fields || []).map((f: any) => [f.name, f]))

    const bank = byName['bank_section']
    expect(bank.type).toBe('group')
    const bankNames = bank.fields.map((f: any) => f.name)
    expect(bankNames).toEqual(['section_name', 'section_contents'])
    const bankRel = bank.fields.find((f: any) => f.name === 'section_contents')
    expect(bankRel.type).toBe('relationship')
    expect(bankRel.relationTo).toBe('shops')
    expect(bankRel.hasMany).toBe(true)

    const services = byName['services']
    expect(services.type).toBe('array')
    const serviceNames = services.fields.map((f: any) => f.name)
    expect(serviceNames).toEqual([
      'image_icon',
      'service_name',
      'description',
      'floor',
      'location_zone',
    ])
    const serviceFloor = services.fields.find((f: any) => f.name === 'floor')
    expect(serviceFloor.type).toBe('relationship')
    expect(serviceFloor.relationTo).toBe('floors')
    expect(serviceFloor.hasMany).toBe(true)

    const facilities = byName['facilities']
    expect(facilities.type).toBe('array')
    const facNames = facilities.fields.map((f: any) => f.name)
    expect(facNames).toEqual([
      'image_icon',
      'facility_name',
      'description',
      'floor',
      'location_zone',
    ])
    const facFloor = facilities.fields.find((f: any) => f.name === 'floor')
    expect(facFloor.type).toBe('relationship')
    expect(facFloor.relationTo).toBe('floors')
    expect(facFloor.hasMany).toBe(true)
  })

  it('enables timestamps', () => {
    expect(Facilities.timestamps).toBe(true)
  })
})
