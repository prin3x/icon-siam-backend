import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const IconsiamAwards: CollectionConfig = {
  slug: 'iconsiam-awards',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'sort_order'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
      required: true,
      defaultValue: 'ICONSIAM AWARDS',
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
        'ICONSIAM proudly holds prestigious awards, celebrating its excellence in design, retail, culture, and lifestyle as a global and Thai landmark.',
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
      name: 'featured_awards',
      type: 'array',
      label: 'Featured Awards (Carousel)',
      hidden: true,
      fields: [
        {
          name: 'award_image',
          type: 'upload',
          label: 'Award Trophy/Image',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'award_title',
          type: 'text',
          label: 'Award Title',
          localized: true,
          required: true,
        },
        {
          name: 'award_description',
          type: 'textarea',
          label: 'Award Description',
          localized: true,
        },
        {
          name: 'year',
          type: 'text',
          label: 'Year Received',
        },
        {
          name: 'category',
          type: 'text',
          label: 'Category',
        },
        {
          name: 'order',
          type: 'number',
          label: 'Display Order',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'awards_by_year',
      type: 'array',
      localized: true,
      label: 'Awards by Year',
      fields: [
        {
          name: 'year',
          type: 'text',
          label: 'Year',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Featured Image for Year',
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
