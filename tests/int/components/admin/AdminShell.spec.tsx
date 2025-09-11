import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock('@/components/admin/LocaleContext', () => ({ useLocale: () => ({ locale: 'en' }) }))

vi.mock('@/utilities/navigation', () => ({
  navigateWithLocale: (...args: any[]) => mockedNavigate(...args),
}))
const mockedNavigate = vi.fn()

vi.mock('@/components/admin/CollectionsList', () => ({ GROUPS: { Test: ['homepage'] } }))
vi.mock('@/components/admin/LocaleSwitcher', () => ({ LocaleSwitcher: () => <div>switch</div> }))

import { AdminShell } from '@/components/admin/AdminShell'

describe('AdminShell', () => {
  beforeEach(() => {
    mockedNavigate.mockReset()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('renders children and toggles sidebar on mobile', () => {
    ;(window.matchMedia as any).mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    render(
      <AdminShell>
        <div>content</div>
      </AdminShell>,
    )

    const menuBtn = screen.getByText('☰ Menu')
    expect(menuBtn).toBeTruthy()
    fireEvent.click(menuBtn)
  })

  it('navigates via group links and back link', () => {
    const { container } = render(
      <AdminShell>
        <div>content</div>
      </AdminShell>,
    )

    const firstShell = container.querySelectorAll('.custom-admin-shell')[0] as HTMLElement
    const back = within(firstShell).getByText('← Back')
    fireEvent.click(back)
    expect(mockedNavigate).toHaveBeenCalledWith(expect.anything(), '/custom-admin', 'en')

    const home = within(firstShell).getByText('Homepage')
    fireEvent.click(home)
    expect(mockedNavigate).toHaveBeenCalledWith(
      expect.anything(),
      '/custom-admin/collections/homepage',
      'en',
    )
  })
})
