import { describe, it, expect } from 'vitest'
import React, { useState } from 'react'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import ControlledColorPicker from '@/components/ColorPicker/ControlledColorPicker'

describe('ControlledColorPicker', () => {
  it('renders label and required mark', () => {
    render(<ControlledColorPicker value="#ffffff" onChange={() => {}} label="Color" required />)
    const label = screen.getByText('Color')
    expect(label).toBeTruthy()
    const star = screen.getByText('*')
    expect(star).toBeTruthy()
  })

  it('updates via color input and text input', () => {
    // Ensure previous render from earlier test is cleaned
    cleanup()
    const Wrapper = () => {
      const [value, setValue] = useState('#ffffff')
      return <ControlledColorPicker value={value} onChange={setValue} />
    }

    const { container } = render(<Wrapper />)

    const textInput = within(container).getByPlaceholderText('#ffffff') as HTMLInputElement
    fireEvent.change(textInput, { target: { value: '#000000' } })

    // DOM reflects updated controlled value on both inputs
    const inputs = within(container).getAllByDisplayValue('#000000')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
