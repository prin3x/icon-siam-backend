import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { GridView } from '@/components/admin/GridView'

describe('GridView', () => {
  const items = [{ id: '1', title: 'Item 1', description: 'Desc', status: 'ACTIVE' }]

  it('renders card and calls handlers', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onPreview = vi.fn()
    render(<GridView items={items} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} />)

    expect(screen.getByText('Item 1')).toBeTruthy()

    const card = screen.getByText('Item 1').closest('div') as HTMLElement
    const buttons = within(card).getAllByRole('button')
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])
    fireEvent.click(buttons[2])

    expect(onPreview).toHaveBeenCalledWith('1')
    expect(onEdit).toHaveBeenCalledWith('1')
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
