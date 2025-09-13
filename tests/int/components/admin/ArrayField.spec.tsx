import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'

import { ArrayField } from '@/components/admin/ArrayField'

vi.mock('@/utilities/fieldDisplay', () => ({ shouldHideField: () => false }))

// Avoid rendering complex child components; stub them
vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: any) => (
    <textarea aria-label="rte" value={value || ''} onChange={(e) => onChange(e.target.value)} />
  ),
}))
vi.mock('@/components/admin/ImageUpload', () => ({
  ImageUpload: ({ value, onChange }: any) => (
    <button aria-label="image-upload" onClick={() => onChange({ id: '1', url: '/x.png' })}>
      upload
    </button>
  ),
}))
vi.mock('@/components/admin/RelationshipField', () => ({
  RelationshipField: ({ onChange }: any) => (
    <button aria-label="rel" onClick={() => onChange({ relationTo: 'x', value: '1' })}>
      relate
    </button>
  ),
}))

describe('ArrayField', () => {
  it('adds an item with defaults and updates a text field', () => {
    const onChange = vi.fn()

    render(
      <ArrayField
        value={[]}
        onChange={onChange}
        field={{
          name: 'items',
          label: 'Items',
          fields: [
            { name: 'title', type: 'text', label: 'Title', defaultValue: 'Untitled' },
            { name: 'flag', type: 'checkbox', label: 'Flag', defaultValue: true },
          ],
        }}
      />,
    )

    fireEvent.click(screen.getByText('Add Items'))

    // default value populated
    const titleArea = screen.getByPlaceholderText('Enter title...') as HTMLTextAreaElement
    expect(titleArea.value).toBe('Untitled')

    fireEvent.change(titleArea, { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenLastCalledWith([{ title: 'Hello', flag: true }])

    // toggle checkbox off
    const checkbox = screen.getByRole('checkbox', { name: 'Flag' })
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenLastCalledWith([{ title: 'Hello', flag: false }])
  })

  it('reorders items using up/down', () => {
    const onChange = vi.fn()

    const { container } = render(
      <ArrayField
        value={[{ title: 'A' }, { title: 'B' }, { title: 'C' }]}
        onChange={onChange}
        field={{
          name: 'items',
          label: 'Items',
          fields: [{ name: 'title', type: 'text', label: 'Title' }],
        }}
      />,
    )

    const cards = Array.from(container.querySelectorAll('[draggable="true"]')) as HTMLElement[]

    // move second up
    fireEvent.click(within(cards[1]).getByText('↑'))
    expect(onChange).toHaveBeenCalled()

    // move first down
    fireEvent.click(within(cards[0]).getByText('↓'))
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('removes an item', () => {
    const onChange = vi.fn()

    const { container } = render(
      <ArrayField
        value={[{ title: 'A' }, { title: 'B' }]}
        onChange={onChange}
        field={{
          name: 'items',
          label: 'Items',
          fields: [{ name: 'title', type: 'text', label: 'Title' }],
        }}
      />,
    )

    const cards = Array.from(container.querySelectorAll('[draggable="true"]')) as HTMLElement[]
    // remove second
    fireEvent.click(within(cards[1]).getByText('Remove'))
    expect(onChange).toHaveBeenCalled()
  })
})
