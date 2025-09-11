import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/components/LocationZonePicker', () => ({
  __esModule: true,
  default: ({ field, value, onChange }: any) => (
    <button aria-label="location-zone" onClick={() => onChange('Z1')}>
      {field.name}:{value || ''}
    </button>
  ),
}))

vi.mock('@/components/ColorPicker/ControlledColorPicker', () => ({
  __esModule: true,
  default: ({ value, onChange, label }: any) => (
    <button aria-label="color-picker" onClick={() => onChange('#000000')}>
      {label}:{value}
    </button>
  ),
}))

vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: any) => (
    <button aria-label="rte" onClick={() => onChange('RT')}>
      {value || 'RT'}
    </button>
  ),
}))

vi.mock('@/components/admin/ImageUpload', () => ({
  ImageUpload: ({ onChange }: any) => (
    <button aria-label="upload" onClick={() => onChange({ id: 1 })}>
      upload
    </button>
  ),
}))

vi.mock('@/components/admin/RelationshipField', () => ({
  RelationshipField: ({ onChange }: any) => (
    <button aria-label="rel" onClick={() => onChange(123)}>
      rel
    </button>
  ),
}))

vi.mock('@/components/admin/ArrayField', () => ({
  ArrayField: ({ onChange }: any) => (
    <button aria-label="array" onClick={() => onChange([{ x: 1 }])}>
      array
    </button>
  ),
}))

vi.mock('@/components/admin/GroupField', () => ({
  GroupField: ({ onChange }: any) => (
    <button aria-label="group" onClick={() => onChange({ x: 1 })}>
      group
    </button>
  ),
}))

vi.mock('@/components/admin/CollapsibleField', () => ({
  CollapsibleField: ({ onChange }: any) => (
    <button aria-label="collapsible" onClick={() => onChange({ y: 1 })}>
      collapsible
    </button>
  ),
}))

vi.mock('@/components/admin/RowField', () => ({
  RowField: ({ onChange }: any) => (
    <button aria-label="row" onClick={() => onChange({ z: 1 })}>
      row
    </button>
  ),
}))

vi.mock('@/components/admin/TabsField', () => ({
  TabsField: ({ onChange }: any) => (
    <button aria-label="tabs" onClick={() => onChange({ t: 1 })}>
      tabs
    </button>
  ),
}))

import { FieldRenderer } from '@/components/admin/FieldRenderer'

describe('FieldRenderer', () => {
  it('renders custom LocationZonePicker and ColorPicker', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <FieldRenderer
        field={{
          name: 'location_zone',
          admin: { components: { Field: '@/components/LocationZonePicker' } },
        }}
        formData={{}}
        handleInputChange={onChange}
      />,
    )
    fireEvent.click(screen.getByLabelText('location-zone'))
    expect(onChange).toHaveBeenCalledWith('location_zone', 'Z1')

    rerender(
      <FieldRenderer
        field={{
          name: 'bg',
          label: 'BG',
          required: true,
          admin: { components: { Field: '@/components/ColorPicker' } },
        }}
        formData={{}}
        handleInputChange={onChange}
      />,
    )
    fireEvent.click(screen.getByLabelText('color-picker'))
    expect(onChange).toHaveBeenCalledWith('bg', '#000000')
  })

  it('renders textarea for text/textarea and shows error', () => {
    const onChange = vi.fn()
    render(
      <FieldRenderer
        field={{ name: 'title', type: 'text', label: 'Title' }}
        formData={{ title: 'A' }}
        handleInputChange={onChange}
        fieldError="Required"
      />,
    )
    expect(screen.getByText('Required')).toBeTruthy()
    fireEvent.change(screen.getByDisplayValue('A'), { target: { value: 'B' } })
    expect(onChange).toHaveBeenCalledWith('title', 'B')
  })

  it('renders checkbox and select and propagates changes', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <FieldRenderer
        field={{ name: 'flag', type: 'checkbox', label: 'Flag' }}
        formData={{ flag: false }}
        handleInputChange={onChange}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith('flag', true)

    rerender(
      <FieldRenderer
        field={{
          name: 'status',
          type: 'select',
          label: 'Status',
          options: [
            { label: 'A', value: 'A' },
            { label: 'B', value: 'B' },
          ],
        }}
        formData={{ status: 'A' }}
        handleInputChange={onChange}
      />,
    )
    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'B' } })
    expect(onChange).toHaveBeenCalledWith('status', 'B')
  })

  it('renders richText, upload, relationship, array, group, collapsible, row, tabs', () => {
    const onChange = vi.fn()
    const fields = [
      { name: 'r', type: 'richText' },
      { name: 'u', type: 'upload' },
      { name: 'rel', type: 'relationship' },
      { name: 'a', type: 'array' },
      { name: 'g', type: 'group' },
      { name: 'c', type: 'collapsible' },
      { name: 'rw', type: 'row' },
      { name: 't', type: 'tabs' },
    ]
    render(
      <div>
        {fields.map((f) => (
          <FieldRenderer key={f.name} field={f as any} formData={{}} handleInputChange={onChange} />
        ))}
      </div>,
    )

    fireEvent.click(screen.getByLabelText('rte'))
    fireEvent.click(screen.getByLabelText('upload'))
    fireEvent.click(screen.getByLabelText('rel'))
    fireEvent.click(screen.getByLabelText('array'))
    fireEvent.click(screen.getByLabelText('group'))
    fireEvent.click(screen.getByLabelText('collapsible'))
    fireEvent.click(screen.getByLabelText('row'))
    fireEvent.click(screen.getByLabelText('tabs'))

    expect(onChange).toHaveBeenCalledTimes(8)
  })
})
