import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URL(window.location.href).searchParams,
}))

import { LocaleProvider, useLocale } from '@/components/admin/LocaleContext'

function Consumer() {
  const { locale, setLocale, supported } = useLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale('th')}>set-th</button>
      <div data-testid="supported">{supported.map((l) => l.code).join(',')}</div>
    </div>
  )
}

describe('LocaleContext', () => {
  beforeEach(() => {
    replace.mockReset()
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost'),
      writable: true,
      configurable: true,
    })
    // reset storage and cookie
    localStorage.clear()
    document.cookie = 'admin-locale=; Max-Age=0'
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults to en and persists on change', () => {
    render(
      <LocaleProvider>
        <Consumer />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('locale').textContent).toBe('en')

    fireEvent.click(screen.getByText('set-th'))

    expect(screen.getByTestId('locale').textContent).toBe('th')
    expect(localStorage.getItem('admin-locale')).toBe('th')
    expect(document.cookie.includes('admin-locale=th')).toBe(true)
    expect(replace).toHaveBeenCalled()
  })

  it('uses URL param when present and valid', () => {
    const url = new URL('http://localhost?locale=zh')
    Object.defineProperty(window, 'location', { value: url })

    render(
      <LocaleProvider>
        <Consumer />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('locale').textContent).toBe('zh')
  })
})
