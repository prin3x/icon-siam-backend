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

import { TabsField } from '@/components/admin/TabsField'

describe('TabsField', () => {
  it('switches tabs and updates nested values', () => {
    const onChange = vi.fn()

    render(
      <TabsField
        field={{
          name: 'tabs',
          type: 'tabs',
          label: 'Tabs',
          tabs: [
            { label: 'General', fields: [{ name: 'title', type: 'text', label: 'Title' }] },
            {
              label: 'Meta',
              fields: [{ name: 'description', type: 'text', label: 'Description' }],
            },
          ],
        }}
        value={[{ title: '' }, { description: '' }]}
        onChange={onChange}
      />,
    )

    // Default active is first tab
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ 0: { title: 'Hello' }, 1: { description: '' } }),
    )

    // Switch to second tab
    fireEvent.click(screen.getByText('Meta'))
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'World' } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ 0: { title: '' }, 1: { description: 'World' } }),
    )
  })
})
