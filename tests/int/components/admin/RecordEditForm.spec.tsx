import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))

vi.mock('@/utilities/navigation', () => ({
  navigateWithLocale: (...args: any[]) => mockedNavigate(...args),
}))
const mockedNavigate = vi.fn()

vi.mock('@/components/admin/LocaleContext', () => ({ useLocale: () => ({ locale: 'en' }) }))

vi.mock('@/components/admin/formLayouts', () => ({
  getLayoutForCollection: () => undefined,
}))

vi.mock('@/components/admin/FieldRenderer', () => ({
  FieldRenderer: ({ field, formData, handleInputChange, fieldError }: any) => (
    <div>
      <span data-testid={`field-${field.name}`}>{String(formData[field.name] ?? '')}</span>
      <button type="button" onClick={() => handleInputChange(field.name, 'X')}>
        set-{field.name}
      </button>
      {fieldError && (
        <div data-testid={`err-${field.name}`} role="alert">
          {fieldError}
        </div>
      )}
    </div>
  ),
}))

import { RecordEditForm } from '@/components/admin/RecordEditForm'

const ORIGINAL_FETCH = global.fetch

describe('RecordEditForm', () => {
  beforeEach(() => {
    mockedNavigate.mockReset()
  })

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH as any
    cleanup()
  })

  it('create mode: builds defaults, renders fields, submits POST and navigates', async () => {
    const fetchMock = vi
      .fn()
      // schema fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fields: [
            { name: 'title', type: 'text', label: 'Title' },
            { name: 'count', type: 'number', defaultValue: 2 },
            { name: 'flag', type: 'checkbox', defaultValue: false },
            { name: 'tags', type: 'array' },
            { name: 'rel', type: 'relationship', relationTo: 'categories', hasMany: true },
            { name: 'hidden_one', type: 'text', hidden: true },
          ],
        }),
      })
      // submit POST
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    // @ts-ignore
    global.fetch = fetchMock

    render(<RecordEditForm collectionSlug="promotions" />)

    // heading
    expect(await screen.findByText('Create New promotions')).toBeTruthy()

    // defaults rendered
    expect(screen.getByTestId('field-title').textContent).toBe('')
    expect(screen.getByTestId('field-count').textContent).toBe('2')
    expect(screen.getByTestId('field-flag').textContent).toBe('false')
    expect(screen.getByTestId('field-tags').textContent).toBe('')

    // submit
    fireEvent.click(screen.getByText('Create Record'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const postCall = fetchMock.mock.calls[1]
    expect(postCall[0]).toContain('/api/custom-admin/promotions?locale=en')
    expect(postCall[1].method).toBe('POST')

    expect(mockedNavigate).toHaveBeenCalledWith(
      expect.anything(),
      '/custom-admin/collections/promotions',
      'en',
    )
  })

  it('edit mode: pre-populates and shows server and field errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fields: [
            { name: 'title', type: 'text' },
            { name: 'count', type: 'number' },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ title: 'Old', count: 5 }) })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Invalid data',
          errors: [{ path: 'title', message: 'Required' }],
        }),
      })
    // @ts-ignore
    global.fetch = fetchMock

    render(<RecordEditForm collectionSlug="events" recordId="123" />)

    expect(await screen.findByText('Edit events')).toBeTruthy()

    // shows existing values
    const titleEls = screen.getAllByTestId('field-title')
    expect(titleEls.some((el) => el.textContent === 'Old')).toBe(true)
    expect(screen.getByTestId('field-count').textContent).toBe('5')

    fireEvent.click(screen.getByText('Save Changes'))

    // assert specific server error and field error independently
    expect(await screen.findByText('Invalid data')).toBeTruthy()
    expect(await screen.findByTestId('err-title')).toBeTruthy()
  })

  it('renders load error when schema fetch fails', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' })
    // @ts-ignore
    global.fetch = fetchMock

    render(<RecordEditForm collectionSlug="shops" />)

    expect(await screen.findByText(/Error: Failed to fetch schema/)).toBeTruthy()
  })
})
