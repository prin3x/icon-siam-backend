import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import LocationZonePicker from '@/components/LocationZonePicker'

describe('LocationZonePicker', () => {
  it('renders label and options, calls onChange', () => {
    const onChange = vi.fn()

    render(<LocationZonePicker path="p" field={{ label: 'Zone' }} value="" onChange={onChange} />)

    expect(screen.getByText('Zone')).toBeTruthy()

    const select = screen.getByRole('combobox') as HTMLSelectElement
    // includes placeholder + zones
    expect(select.value).toBe('')

    fireEvent.change(select, { target: { value: 'ICONLUXE' } })
    expect(onChange).toHaveBeenCalledWith('ICONLUXE')
  })
})
