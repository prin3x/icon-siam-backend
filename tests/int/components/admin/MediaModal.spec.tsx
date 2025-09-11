import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'

vi.mock('@/utilities/apiKeyUtils', () => ({
  getApiHeaders: () => ({}),
  isInternalRequest: () => false,
}))

const originalFetch = global.fetch

describe('MediaModal', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn()
  })
  afterEach(() => {
    cleanup()
    // @ts-ignore
    global.fetch = originalFetch
  })

  it('loads media and selects an item', async () => {
    const onClose = vi.fn()
    const onSelect = vi.fn()

    // first call: list media
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [
          { id: '1', url: '/m1.jpg', filename: 'm1.jpg' },
          { id: '2', url: '/m2.jpg', filename: 'm2.jpg' },
        ],
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      }),
    })

    const { MediaModal } = await import('@/components/admin/MediaModal')

    render(<MediaModal onClose={onClose} onSelect={onSelect} />)

    expect(await screen.findByText('Loading media...')).toBeTruthy()

    const img = await screen.findByAltText('m1.jpg')
    fireEvent.click(img)

    expect(onSelect).toHaveBeenCalledWith({ id: '1', url: '/m1.jpg', filename: 'm1.jpg' })
  })

  it('uploads by URL and calls onSelect', async () => {
    const onClose = vi.fn()
    const onSelect = vi.fn()

    // first call: list media (select tab fetch)
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ docs: [], totalPages: 1, hasNextPage: false, hasPrevPage: false }),
    })
    // second call: URL upload POST
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '9', url: '/u.jpg', filename: 'u.jpg' }),
    })

    const { MediaModal } = await import('@/components/admin/MediaModal')

    render(<MediaModal onClose={onClose} onSelect={onSelect} />)

    // switch to URL tab
    fireEvent.click(screen.getAllByRole('button', { name: 'URL Upload' })[0])

    const input = screen.getByPlaceholderText('https://example.com/image.jpg')
    fireEvent.change(input, { target: { value: 'https://site/img.jpg' } })

    fireEvent.click(screen.getByRole('button', { name: 'Add Image' }))

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ id: '9', url: '/u.jpg', filename: 'u.jpg' }),
    )
  })
})
