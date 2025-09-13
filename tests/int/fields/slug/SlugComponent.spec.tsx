import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

const mockUseField = vi.fn()
const mockUseFormFields = vi.fn()
const mockDispatchFields = vi.fn()

vi.mock('@payloadcms/ui', async () => {
  return {
    useField: (args: any) => mockUseField(args),
    Button: ({ children, onClick, className }: any) => (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    ),
    TextInput: ({ value, onChange, readOnly }: any) => (
      <input
        aria-label="slug-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
      />
    ),
    FieldLabel: ({ label }: any) => <label>{label}</label>,
    useFormFields: (selector: any) => mockUseFormFields(selector),
    useForm: () => ({ dispatchFields: mockDispatchFields }),
  }
})

import { SlugComponent } from '@/fields/slug/SlugComponent'

function setupMocks({
  checkboxValue,
  targetValue,
  slugValue,
}: {
  checkboxValue: boolean
  targetValue: string
  slugValue: string
}) {
  mockUseFormFields.mockImplementation((selector: any) =>
    selector([{ ['autoslug']: { value: checkboxValue }, title: { value: targetValue } }]),
  )
  mockUseField.mockReturnValue({ value: slugValue, setValue: vi.fn() })
}

describe('SlugComponent', () => {
  beforeEach(() => {
    mockUseField.mockReset()
    mockUseFormFields.mockReset()
    mockDispatchFields.mockReset()
  })

  it('shows Lock/Unlock toggle and dispatches to toggle checkbox', () => {
    setupMocks({ checkboxValue: false, targetValue: '', slugValue: '' })

    render(
      <SlugComponent
        field={{ name: 'slug', label: 'Slug' } as any}
        fieldToUse="title"
        checkboxFieldPath="autoslug"
        path="post"
        readOnly={false}
      />,
    )

    fireEvent.click(screen.getByText('Lock'))
    expect(mockDispatchFields).toHaveBeenCalledWith({
      type: 'UPDATE',
      path: 'autoslug',
      value: true,
    })
  })
})
