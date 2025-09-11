import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ListView } from '@/components/admin/ListView'

describe('ListView', () => {
  const items = [{ id: '1', title: 'Row 1', description: 'Desc', status: 'ACTIVE' }]

  it('renders rows and triggers handlers', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onPreview = vi.fn()

    render(<ListView items={items} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} />)

    expect(screen.getByText('Row 1')).toBeTruthy()
    fireEvent.click(screen.getByText('Preview'))
    fireEvent.click(screen.getByText('Edit'))
    fireEvent.click(screen.getByText('Delete'))

    expect(onPreview).toHaveBeenCalledWith('1')
    expect(onEdit).toHaveBeenCalledWith('1')
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
