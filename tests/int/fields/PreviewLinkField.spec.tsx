import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import { PreviewLinkField } from '@/fields/PreviewLinkField'

describe('PreviewLinkField', () => {
  it('renders input and helper, calls onChange', () => {
    const onChange = vi.fn()
    render(<PreviewLinkField value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText('https://example.com')
    fireEvent.change(input, { target: { value: 'https://x.com' } })
    expect(onChange).toHaveBeenCalledWith('https://x.com')

    expect(screen.getByText('Enter a URL to preview')).toBeTruthy()
  })

  it('shows Open link when value present', () => {
    render(<PreviewLinkField value="https://x.com" onChange={() => {}} />)

    const link = screen.getByText('Open') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('https://x.com')
  })
})
