import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { ComboBox } from '@/components/admin/ComboBox'

describe('ComboBox', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })
  afterEach(() => cleanup())

  const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
  ]

  it('filters and selects an option with mouse', () => {
    const onChange = vi.fn()
    render(<ComboBox value="" onChange={onChange} options={options} placeholder="Pick" />)

    const input = screen.getByPlaceholderText('Pick') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ap' } })

    expect(onChange).toHaveBeenCalledWith('ap')

    fireEvent.click(screen.getByText('Apple'))
    expect(onChange).toHaveBeenCalledWith('apple')
  })

  it('selects first filtered option with Enter and closes with Escape', () => {
    const onChange = vi.fn()
    render(<ComboBox value="" onChange={onChange} options={options} />)

    const input = screen.getByPlaceholderText('Type or select...') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'ch' } })

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('cherry')

    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Escape' })
  })

  it('closes when clicking outside', () => {
    const onChange = vi.fn()
    render(<ComboBox value="" onChange={onChange} options={options} />)

    const input = screen.getByPlaceholderText('Type or select...')
    fireEvent.focus(input)

    fireEvent.mouseDown(document.body)
  })
})
