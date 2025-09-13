import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children, style }: any) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}))

import CustomLoginButton from '@/components/SignInWithAzure'

describe('CustomLoginButton', () => {
  it('renders link with correct href and text', () => {
    render(<CustomLoginButton />)

    const link = screen.getByRole('link', { name: 'Sign in with Microsoft' }) as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe(
      '/api/auth/signin/azure-ad?callbackUrl=%2Fapi%2Fauth%2Fbridge',
    )
  })
})
