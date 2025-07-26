import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const VisionMission: CollectionConfig = {
  slug: 'vision-mission',
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
      defaultValue: 'VISION AND MISSION',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      localized: true,
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
      name: 'intro_text',
      type: 'textarea',
      label: 'Introduction Text',
      localized: true,
      admin: {
        description: 'The main introduction text that appears below the banner',
      },
    },
    {
      name: 'content_sections',
      type: 'array',
      label: 'Content Sections',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Description',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Section Image',
          relationTo: 'media',
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
