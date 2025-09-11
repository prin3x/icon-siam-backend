import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TableView } from '@/components/admin/TableView'

describe('TableView', () => {
  const items = [
    { id: '1', title: 'A', status: 'ACTIVE', createdAt: '2024-01-01T10:00:00.000Z' },
    { id: '2', title: 'B', status: 'INACTIVE', createdAt: '2024-01-02T12:34:00.000Z' },
  ]

  it('renders rows and allows sorting header click', () => {
    const onSortChange = vi.fn()
    render(
      <TableView
        items={items}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPreview={vi.fn()}
        sortKey="title"
        sortOrder="asc"
        onSortChange={onSortChange}
      />,
    )

    fireEvent.click(screen.getByText('Created'))
    expect(onSortChange).toHaveBeenCalled()
  })

  it('formats date and displays text via toDisplayString', () => {
    render(<TableView items={items} onEdit={vi.fn()} onDelete={vi.fn()} onPreview={vi.fn()} />)
    const rows = screen.getAllByRole('row')
    const createdCell = within(rows[1]).getAllByRole('cell')[2]
    expect(within(createdCell).getByText((t) => t.includes('01/01/2024'))).toBeTruthy()

    const titleCell = within(rows[1]).getAllByRole('cell')[0]
    expect(within(titleCell).getByText('A')).toBeTruthy()
  })
})
