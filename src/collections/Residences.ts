import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const Residences: CollectionConfig = {
  slug: 'residences',
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
      label: 'Page Title',
      localized: true,
      required: true,
      defaultValue: 'RESIDENCES',
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
      name: 'residence_sections',
      type: 'array',
      label: 'Residence Sections',
      localized: true,
      fields: [
        {
          name: 'logo',
          type: 'upload',
          label: 'Residence Logo',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Residence Title',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Residence Image',
          relationTo: 'media',
        },
        {
          name: 'sort_order',
          type: 'number',
          label: 'Sort Order',
          defaultValue: 0,
        },
        {
          name: 'call_to_action',
          type: 'group',
          label: 'Call to Action',
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Button Text',
              defaultValue: 'GO TO WEBSITE',
            },
            {
              name: 'link',
              type: 'text',
              label: 'Button Link',
            },
          ],
        },
      ],
    },
    {
      name: 'gallery',
      type: 'group',
      label: 'Gallery Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Gallery Title',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Gallery Description',
          localized: true,
        },
        {
          name: 'images',
          type: 'array',
          label: 'Gallery Images',
          maxRows: 4,
          fields: [
            {
              name: 'image',
              type: 'upload',
              label: 'Gallery Image',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'alt_text',
              type: 'text',
              label: 'Alt Text',
              localized: true,
            },
          ],
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
