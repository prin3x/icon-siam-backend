import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('@/utilities/apiKeyUtils', () => ({ getApiHeaders: () => ({}) }))

vi.mock('@/components/admin/MediaModal', () => ({
  MediaModal: ({ onClose, onSelect }: any) => (
    <div>
      <button aria-label="modal-close" onClick={onClose}>
        x
      </button>
      <button aria-label="modal-select" onClick={() => onSelect({ id: '2', url: '/u.png' })}>
        select
      </button>
    </div>
  ),
}))

import { ImageUpload } from '@/components/admin/ImageUpload'

describe('ImageUpload', () => {
  it('renders preview from object and removes it', () => {
    const onChange = vi.fn()
    render(<ImageUpload value={{ id: '1', url: '/a.png', filename: 'A' }} onChange={onChange} />)

    expect(screen.getByAltText('Preview')).toBeTruthy()
    expect(screen.getByText('A')).toBeTruthy()

    fireEvent.click(screen.getByTitle('Remove image'))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
