import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/components/admin/FieldRenderer', () => ({
  FieldRenderer: ({ field, formData, handleInputChange }: any) => (
    <div>
      <label htmlFor={field.name}>{field.label || field.name}</label>
      <input
        id={field.name}
        value={formData[field.name] || ''}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
      />
    </div>
  ),
}))

import { RowField } from '@/components/admin/RowField'

describe('RowField', () => {
  it('updates nested values via FieldRenderer handlers', () => {
    const onChange = vi.fn()

    render(
      <RowField
        field={{
          name: 'row',
          type: 'row',
          label: 'Row',
          fields: [
            { name: 'first', type: 'text', label: 'First' },
            { name: 'second', type: 'number', label: 'Second' },
          ],
        }}
        value={{ first: 'A', second: 1 }}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('First'), { target: { value: 'B' } })
    expect(onChange).toHaveBeenCalledWith({ first: 'B', second: 1 })

    fireEvent.change(screen.getByLabelText('Second'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith({ first: 'A', second: '2' })
  })
})
