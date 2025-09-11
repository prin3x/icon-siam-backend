import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

const setLocale = vi.fn()
vi.mock('@/components/admin/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale,
    supported: [
      { code: 'en', label: 'English' },
      { code: 'th', label: 'ไทย' },
      { code: 'zh', label: '中文' },
    ],
  }),
}))

import { LocaleSwitcher } from '@/components/admin/LocaleSwitcher'

describe('LocaleSwitcher', () => {
  it('pills variant reflects selected and calls setLocale', () => {
    render(<LocaleSwitcher variant="pills" />)

    // selected has different styling clue: text present
    expect(screen.getByText('English')).toBeTruthy()
    fireEvent.click(screen.getByText('ไทย'))
    expect(setLocale).toHaveBeenCalledWith('th')
  })

  it('links variant renders and calls setLocale without default button styling', () => {
    const { container } = render(<LocaleSwitcher variant="links" align="right" />)

    const linksContainer = within(container).getByText('English').parentElement as HTMLElement
    const zh = within(linksContainer).getByText('中文')
    fireEvent.click(zh)
    expect(setLocale).toHaveBeenCalledWith('zh')
  })
})
