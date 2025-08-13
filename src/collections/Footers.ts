import type { CollectionConfig } from 'payload'

export const Footers: CollectionConfig = {
  slug: 'footers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'connect_with_us', 'awards', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'button_text',
      type: 'text',
      label: 'Button Text',
      localized: true,
    },
    {
      name: 'button_link',
      type: 'text',
      label: 'Button Link',
      localized: true,
    },
    {
      name: 'connect_with_us',
      type: 'array',
      label: 'Connect With Us',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'image_icon',
          type: 'upload',
          label: 'Image Icon',
          relationTo: 'media',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link',
        },
      ],
    },
    {
      name: 'awards',
      type: 'array',
      label: 'Awards',
      fields: [
        {
          name: 'image_url',
          type: 'upload',
          label: 'Image URL',
          relationTo: 'media',
        },
      ],
    },
  ],
  timestamps: true,
}
