'use client'

import React from 'react'
import './styles.css'

interface LocationZonePickerProps {
  path: string
  field: any
  value?: string
  onChange?: (value: string) => void
}

const LocationZonePicker = ({ path, field, value, onChange }: LocationZonePickerProps) => {
  const locationZones = [
    'SIAM Takashimaya',
    'ICONEATS',
    'Attraction Hall',
    'ICONSIAM Park',
    'ICONVILLE',
    'SOOKSIAM',
    'The Veranda',
    'ICONLUXE',
    'Dining on 4th',
    'ICONCRAFT',
    'ICON Education',
    'Dining on 5th',
    'Charoennakorn Hall',
    'Rassada Hall',
    'Wattana Hall',
    'Suralai Hall',
    'Thara Hall',
    'Alangkarn',
    'Napalai Terrace',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className="location-zone-picker">
      <label className="field-label">{field.label || 'Location Zone'}</label>
      <select value={value || ''} onChange={handleChange}>
        <option value="">Select a location zone...</option>
        {locationZones.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LocationZonePicker
