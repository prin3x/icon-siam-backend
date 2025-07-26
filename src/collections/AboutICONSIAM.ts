import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const AboutIconsiam: CollectionConfig = {
  slug: 'about-iconsiam',
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
      name: 'about_iconsiam',
      type: 'group',
      label: 'About ICONSIAM Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'ABOUT ICONSIAM',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          label: 'About ICONSIAM Image',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'development_partners',
      type: 'group',
      label: 'Development Partners Section',
      fields: [
        {
          name: 'image',
          type: 'upload',
          label: 'Development Partners Image',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'DEVELOPMENT PARTNERS',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'partners',
          type: 'array',
          label: 'Partner Companies',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              label: 'Partner Logo',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'board_of_directors',
      type: 'group',
      label: 'Board of Directors Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'BOARD OF DIRECTORS',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Board Members Photo',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'vision_mission',
      type: 'group',
      label: 'Vision and Mission Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'VISION AND MISSION',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Section Image',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
      ],
    },
    {
      name: 'awards',
      type: 'group',
      label: 'ICONSIAM Awards Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          localized: true,
          defaultValue: 'ICONSIAM AWARDS',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          localized: true,
        },
        {
          name: 'awards_list',
          type: 'array',
          label: 'Awards',
          fields: [
            {
              name: 'image',
              type: 'upload',
              label: 'Award Image/Trophy',
              relationTo: 'media',
            },
            {
              name: 'title',
              type: 'text',
              label: 'Award Title',
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Award Description',
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
