import { describe, it, expect } from 'vitest'

import { Dinings } from '@/collections/Dinings'
import { Directory } from '@/collections/Directory'
import { Floors } from '@/collections/Floors'
import { GalleryCollections } from '@/collections/GalleryCollections'
import { GettingHere } from '@/collections/GettingHere'
import { IconCraft } from '@/collections/IconCraft'
import { IconLuxe } from '@/collections/IconLuxe'
import { IconsiamAwards } from '@/collections/IconsiamAwards'
import { Media } from '@/collections/Media'
import { NewsPress } from '@/collections/NewsPress'
import { Residences } from '@/collections/Residences'
import { Shops } from '@/collections/Shops'
import { Stickbar } from '@/collections/Stickbar'
import { Stories } from '@/collections/Stories'
import { VisionMission } from '@/collections/VisionMission'
import { AboutIconsiam } from '@/collections/AboutICONSIAM'

// Helper to assert access.read true when present
function expectPublicRead(collection: any) {
  const read = collection?.access?.read
  if (typeof read === 'function') {
    // @ts-ignore
    expect(read()).toBe(true)
  }
}

describe('Collections function coverage', () => {
  it('calls access.read for collections', () => {
    ;[
      Dinings,
      Directory,
      AboutIconsiam,
      Floors,
      GalleryCollections,
      GettingHere,
      IconCraft,
      IconLuxe,
      IconsiamAwards,
      Media,
      NewsPress,
      Residences,
      Shops,
      Stickbar,
      Stories,
      VisionMission,
    ].forEach(expectPublicRead)
  })

  it('evaluates admin.condition for Dinings opening_hours.per_day', () => {
    const opening = (Dinings.fields || []).find((f: any) => f.name === 'opening_hours') as any
    const perDay = opening.fields.find((f: any) => f.name === 'per_day')
    const cond = perDay.admin.condition as (data: any, siblingData: any) => boolean
    expect(cond({}, { same_hours_every_day: false })).toBe(true)
    expect(cond({}, { same_hours_every_day: true })).toBe(false)
  })

  it('evaluates admin.condition for GettingHere opening_hours.per_day', () => {
    const opening = (GettingHere.fields || []).find((f: any) => f.name === 'opening_hours') as any
    const perDay = opening.fields.find((f: any) => f.name === 'per_day')
    const cond = perDay.admin.condition as (data: any, siblingData: any) => boolean
    expect(cond({}, { same_hours_every_day: false })).toBe(true)
    expect(cond({}, { same_hours_every_day: true })).toBe(false)
  })
})
