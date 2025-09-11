import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('@/utilities/navigation', () => {
  return { navigateWithLocale: vi.fn() }
})

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/components/admin/LocaleContext', () => ({
  useLocale: () => ({ locale: 'en', setLocale: vi.fn(), supported: [] }),
}))

import { navigateWithLocale } from '@/utilities/navigation'
import { CollectionsList } from '@/components/admin/CollectionsList'

describe('CollectionsList', () => {
  beforeEach(() => {
    ;(navigateWithLocale as any).mockReset()
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost'),
      writable: true,
      configurable: true,
    })
  })

  it('renders groups and formatted titles with overrides', () => {
    const { container } = render(<CollectionsList />)
    // Group headings
    expect(screen.getByText('ICONSIAM Collection')).toBeTruthy()
    expect(screen.getByText('Images & Videos')).toBeTruthy()

    // Title overrides and formatting
    expect(screen.getByText('Page Banners')).toBeTruthy()
    expect(screen.getByText('Icon Crafts')).toBeTruthy()
    expect(screen.getByText('API Sync Logs')).toBeTruthy()

    // Count some buttons exist
    const buttons = within(container).getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5)
  })

  it('navigates with locale when clicking without onSelect', () => {
    const { container } = render(<CollectionsList />)

    const firstSection = container.querySelector('section') as HTMLElement
    const promotionsLabel = within(firstSection).getByText('Promotions')
    fireEvent.click(promotionsLabel.closest('button') as HTMLButtonElement)

    expect(navigateWithLocale).toHaveBeenCalled()
    const args = (navigateWithLocale as any).mock.calls[0]
    expect(args[1]).toBe('/custom-admin/collections/promotions')
    expect(args[2]).toBe('en')
  })

  it('calls onSelect when provided and does not navigate', () => {
    const onSelect = vi.fn()
    const { container } = render(<CollectionsList onSelect={onSelect} />)

    const firstSection = container.querySelector('section') as HTMLElement
    const promotionsLabel = within(firstSection).getByText('Promotions')
    fireEvent.click(promotionsLabel.closest('button') as HTMLButtonElement)

    expect(onSelect).toHaveBeenCalledWith('promotions')
    expect(navigateWithLocale).not.toHaveBeenCalled()
  })
})
