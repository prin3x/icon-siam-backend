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

import { GroupField } from '@/components/admin/GroupField'

describe('GroupField', () => {
  it('passes nested field changes to parent onChange', () => {
    const onChange = vi.fn()

    render(
      <GroupField
        field={{
          name: 'seo',
          type: 'group',
          label: 'SEO',
          fields: [
            { name: 'title', type: 'text', label: 'Title' },
            { name: 'description', type: 'text', label: 'Description' },
          ],
        }}
        value={{ title: '', description: '' }}
        onChange={onChange}
      />,
    )

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenCalledWith({ title: 'Hello', description: '' })

    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'World' } })
    expect(onChange).toHaveBeenCalledWith({ title: '', description: 'World' })
  })
})
