import type { CollectionConfig } from 'payload'

export const GettingHere: CollectionConfig = {
  slug: 'getting-here',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'contact', 'contact_info'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Getting Here',
      localized: true,
    },
    {
      name: 'custom_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Custom Image',
    },
    {
      name: 'location',
      type: 'textarea',
      label: 'Location',
      localized: true,
    },
    {
      name: 'contact',
      type: 'text',
      label: 'Contact',
      localized: true,
    },
    {
      name: 'contact_info',
      type: 'text',
      label: 'Contact Info',
      localized: true,
    },
    {
      name: 'opening_hours',
      type: 'group',
      label: 'Opening Hours',
      fields: [
        {
          name: 'same_hours_every_day',
          type: 'checkbox',
          label: 'Same hours every day',
          defaultValue: true,
        },
        {
          name: 'open',
          type: 'text',
          label: 'Open Time',
          admin: { placeholder: '10:00' },
        },
        {
          name: 'close',
          type: 'text',
          label: 'Close Time',
          admin: { placeholder: '22:00' },
        },
        {
          name: 'per_day',
          type: 'array',
          label: 'Per Day Hours (if different)',
          admin: {
            condition: (data, siblingData) => !siblingData.same_hours_every_day,
          },
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Mon', value: 'mon' },
                { label: 'Tue', value: 'tue' },
                { label: 'Wed', value: 'wed' },
                { label: 'Thu', value: 'thu' },
                { label: 'Fri', value: 'fri' },
                { label: 'Sat', value: 'sat' },
                { label: 'Sun', value: 'sun' },
              ],
            },
            {
              name: 'open',
              type: 'text',
              required: true,
              label: 'Open Time',
            },
            {
              name: 'close',
              type: 'text',
              required: true,
              label: 'Close Time',
            },
          ],
        },
      ],
    },

    {
      name: 'methods',
      type: 'array',
      label: 'Transport Methods',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Type',
          localized: true,
          options: [
            { label: 'Car', value: 'car' },
            { label: 'BTS SkyTrain', value: 'bts' },
            { label: 'Public Bus', value: 'bus' },
            { label: 'Public Boat', value: 'boat' },
            { label: 'Hotel Service Boat', value: 'hotel_boat' },
            { label: 'Shuttle Boat', value: 'shuttle_boat' },
          ],
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          label: 'Icon (optional)',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          localized: true,
        },
        {
          name: 'details',
          type: 'richText',
          label: 'Details',
          localized: true,
        },
      ],
    },
  ],
}
