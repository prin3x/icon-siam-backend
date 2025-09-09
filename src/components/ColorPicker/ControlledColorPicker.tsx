'use client'

import React from 'react'
import './styles.css'

interface ControlledColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

const ControlledColorPicker = ({
  value,
  onChange,
  label,
  required,
}: ControlledColorPickerProps) => {
  return (
    <div className={'color-picker'}>
      {label && (
        <label className={'field-label'}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className={'color-picker-row'}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
        />
      </div>
    </div>
  )
}

export default ControlledColorPicker
