import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
    },
    {
      name: 'pin_to_directory',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'display_name',
      type: 'text',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Shop', value: 'shops' },
        { label: 'Dining', value: 'dinings' },
        { label: 'Promotion', value: 'promotions' },
        { label: 'Event', value: 'events' },
        { label: 'Directory', value: 'directory' },
        { label: 'News&Press', value: 'news_press' },
        { label: 'The Stories', value: 'stories' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'ACTIVE',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'original_id',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'ID from the original database, used for migration purposes.',
      },
    },
  ],
  timestamps: true,
}
