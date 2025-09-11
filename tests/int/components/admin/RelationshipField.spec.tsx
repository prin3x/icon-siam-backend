import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/components/admin/LocaleContext', () => ({ useLocale: () => ({ locale: 'en' }) }))

const originalFetch = global.fetch

describe('RelationshipField', () => {
  afterEach(() => {
    // @ts-ignore
    global.fetch = originalFetch
  })

  it('shows min search hint, performs search, selects (hasMany)', async () => {
    const fetchMock = vi
      .fn()
      // 1) default suggestions on mount
      .mockResolvedValueOnce({ ok: true, json: async () => ({ docs: [] }) })
      // 2) schema fetch for search keys
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ admin: { useAsTitle: 'title' }, fields: [{ name: 'title' }] }),
      })
      // 3) search results for debounced term
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [{ id: '10', title: 'Foo' }] }),
      })
    // @ts-ignore
    global.fetch = fetchMock

    const onChange = vi.fn()
    const { RelationshipField } = await import('@/components/admin/RelationshipField')

    render(
      <RelationshipField
        value={[]}
        onChange={onChange}
        field={{ name: 'rel', label: 'Related', relationTo: 'categories', hasMany: true }}
      />,
    )

    const input = screen.getByPlaceholderText('Search related...')
    fireEvent.focus(input)
    expect(await screen.findByText(/Type at least/)).toBeTruthy()

    fireEvent.change(input, { target: { value: 'foo' } })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))

    const option = await screen.findByText('Foo')
    fireEvent.click(option)

    expect(onChange).toHaveBeenCalledWith([{ relationTo: 'categories', value: '10' }])
  })
})
