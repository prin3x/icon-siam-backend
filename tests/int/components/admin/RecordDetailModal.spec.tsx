import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/utilities/apiKeyUtils', () => ({
  getApiHeaders: () => ({}),
  isInternalRequest: () => false,
}))

const mockedPush = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockedPush }) }))

const mockedNavigate = vi.fn()
vi.mock('@/utilities/navigation', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, navigateWithLocale: (...args: any[]) => mockedNavigate(...args) }
})

const originalFetch = global.fetch

describe('RecordDetailModal', () => {
  beforeEach(() => {
    mockedPush.mockReset()
    mockedNavigate.mockReset()
    // @ts-ignore
    global.fetch = vi.fn()
  })
  afterEach(() => {
    // @ts-ignore
    global.fetch = originalFetch
  })

  it('loads record and schema then renders details, allows close', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '42',
        title: 'Hello',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00Z',
      }),
    })
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ fields: [{ name: 'title', type: 'text', label: 'Title' }] }),
    })

    const { RecordDetailModal } = await import('@/components/admin/RecordDetailModal')

    const onClose = vi.fn()
    render(
      <RecordDetailModal
        isOpen
        onClose={onClose}
        recordId="42"
        collectionSlug="posts"
        locale="en"
      />,
    )

    expect(await screen.findByText('Record Details')).toBeTruthy()
    expect(await screen.findByText((t) => t.includes('Record ID'))).toBeTruthy()
    expect(await screen.findByText('Title')).toBeTruthy()

    fireEvent.click(screen.getAllByText('Close')[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('backdrop click closes and Edit Record navigates', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ id: '1' }) })
    ;(global.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ fields: [] }) })

    const { RecordDetailModal } = await import('@/components/admin/RecordDetailModal')

    const onClose = vi.fn()
    const { container } = render(
      <RecordDetailModal
        isOpen
        onClose={onClose}
        recordId="1"
        collectionSlug="posts"
        locale="en"
      />,
    )

    expect(await screen.findAllByText('Record Details')).toBeTruthy()

    const modal = container.querySelector('div[style*="max-width: 800px"]') as HTMLElement
    const editButtons = Array.from(modal.querySelectorAll('button')).filter(
      (b) => b.textContent === 'Edit Record',
    )
    fireEvent.click(editButtons[0] as HTMLButtonElement)
    expect(mockedNavigate).toHaveBeenCalled()

    const overlay = container.querySelector('div[style*="position: fixed"]') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error when record fetch fails', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Nope',
      status: 400,
    })
    ;(global.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ fields: [] }) })

    const { RecordDetailModal } = await import('@/components/admin/RecordDetailModal')

    render(
      <RecordDetailModal
        isOpen
        onClose={() => {}}
        recordId="x"
        collectionSlug="posts"
        locale="en"
      />,
    )

    expect(await screen.findByText(/Error:/)).toBeTruthy()
  })
})
