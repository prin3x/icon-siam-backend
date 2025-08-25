import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const BoardOfDirectors: CollectionConfig = {
  slug: 'board-of-directors',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'sort_order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'banner_image',
      type: 'upload',
      label: 'Banner Image',
      relationTo: 'media',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
      required: true,
      defaultValue: 'BOARD OF DIRECTORS',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      localized: true,
      defaultValue:
        "ICONSIAM's Board of Directors comprises visionary leaders shaping its success as a global landmark for shopping, culture, and lifestyle.",
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
      name: 'directors',
      type: 'array',
      label: 'Board Members',
      localized: true,
      fields: [
        {
          name: 'profile_image',
          type: 'upload',
          label: 'Profile Image',
          relationTo: 'media',
        },
        {
          name: 'full_name',
          type: 'text',
          label: 'Full Name',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Position/Title',
          required: true,
        },
        {
          name: 'order',
          type: 'number',
          label: 'Display Order',
          defaultValue: 0,
          admin: {
            description: 'The order in which the board members will be displayed',
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'keywords',
          type: 'textarea',
          localized: true,
          label: 'SEO Keywords',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'SEO Description',
        },
      ],
    },
    ...slugField(),
  ],
  timestamps: true,
}
