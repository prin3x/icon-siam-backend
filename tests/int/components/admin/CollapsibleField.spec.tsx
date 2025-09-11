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

import { CollapsibleField } from '@/components/admin/CollapsibleField'

describe('CollapsibleField', () => {
  it('toggles open/close and passes changes upward', () => {
    const onChange = vi.fn()

    render(
      <CollapsibleField
        field={{
          name: 'meta',
          type: 'collapsible',
          label: 'Meta',
          fields: [{ name: 'subtitle', type: 'text', label: 'Subtitle' }],
        }}
        value={{ subtitle: '' }}
        onChange={onChange}
      />,
    )

    // closed by default; clicking header opens
    fireEvent.click(screen.getByText('Meta'))

    const input = screen.getByLabelText('Subtitle')
    fireEvent.change(input, { target: { value: 'Sub' } })

    expect(onChange).toHaveBeenCalledWith({ subtitle: 'Sub' })

    // toggle closed
    fireEvent.click(screen.getByText('Meta'))
  })
})
