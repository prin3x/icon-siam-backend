import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@payloadcms/ui', () => {
  return {
    useField: () => {
      const [value, setValue] = React.useState('#123456')
      return { value, setValue }
    },
    TextInput: ({ value: v, onChange }: any) => (
      <input
        type="text"
        aria-label="payload-text-input"
        value={v}
        onChange={(e) => onChange?.({ target: { value: e.target.value } })}
      />
    ),
  }
})

import ColorPicker from '@/components/ColorPicker'

describe('ColorPicker (index component)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost'),
      writable: true,
      configurable: true,
    })
  })

  it('renders and updates value via color and text inputs', () => {
    render(<ColorPicker path="color" label="Pick" />)

    // initial render reflects default value and label
    expect(screen.getByText('Pick')).toBeTruthy()
    expect(screen.getAllByDisplayValue('#123456').length).toBeGreaterThan(0)

    // color input
    const colorInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement
    fireEvent.change(colorInput, { target: { value: '#abcdef' } })

    // payload text input
    const text = screen.getByLabelText('payload-text-input') as HTMLInputElement
    fireEvent.change(text, { target: { value: '#000000' } })

    // After interactions, we should see latest value reflected
    expect(screen.getAllByDisplayValue('#000000').length).toBeGreaterThan(0)
  })
})
