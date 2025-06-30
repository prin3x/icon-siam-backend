import type { CollectionConfig } from 'payload'

export const Directory: CollectionConfig = {
  slug: 'directory',
  admin: {
    defaultColumns: ['icon_siam_picks'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'icon_siam_picks',
      type: 'array',
      label: 'Icon Siam Picks',
      fields: [
        {
          name: 'item',
          type: 'relationship',
          label: 'Icon Siam Picks',
          relationTo: ['shops', 'dinings', 'attractions', 'icon-luxe', 'icon-craft'],
          hasMany: true,
          required: true,
        },
        {
          name: 'custom_title',
          type: 'text',
          label: 'Custom Title (optional)',
          localized: true,
        },
        {
          name: 'custom_image',
          type: 'upload',
          label: 'Custom Image (optional)',
          relationTo: 'media',
        },
      ],
    },
  ],
}
