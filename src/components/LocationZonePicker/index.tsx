'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import './styles.css'

interface LocationZonePickerProps {
  path: string
  field: any
}

const LocationZonePicker = ({ path, field }: LocationZonePickerProps) => {
  const { value, setValue } = useField<string>({ path: path || field.name })

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

  return (
    <div className="location-zone-picker">
      <label className="field-label">{field.label || 'Location Zone'}</label>
      <select value={value || ''} onChange={(e) => setValue(e.target.value)}>
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
