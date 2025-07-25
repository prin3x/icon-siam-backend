import type { CollectionConfig } from 'payload'

export const IconLuxe: CollectionConfig = {
  slug: 'icon-luxe',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'main_image_url',
      type: 'upload',
      label: 'Main Image URL',
      relationTo: 'media',
    },
    {
      name: 'title',
      localized: true,
      type: 'textarea',
      label: 'Title',
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
      label: 'Subtitle',
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
    },
    {
      name: 'highlight_title',
      type: 'text',
      label: 'Highlight Title',
      localized: true,
    },
    {
      name: 'highlight_description',
      type: 'textarea',
      label: 'Highlight Description',
      localized: true,
    },
    {
      name: 'highlight_image_url',
      type: 'upload',
      label: 'Feature Image URL',
      relationTo: 'media',
    },
    {
      name: 'showcase_title',
      type: 'text',
      label: 'Showcase Title',
      localized: true,
    },
    {
      name: 'showcase_description',
      type: 'textarea',
      label: 'Showcase Description',
      localized: true,
    },
    {
      name: 'gallery_image_urls',
      type: 'array',
      label: 'Gallery Image URLs',
      fields: [
        {
          name: 'image_url',
          type: 'upload',
          label: 'Image URL',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'ACTIVE',
      options: [
        {
          label: 'Active',
          value: 'ACTIVE',
        },
        {
          label: 'Inactive',
          value: 'INACTIVE',
        },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: 'Meta Description',
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      label: 'Slug',
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords',
      localized: true,
      fields: [
        {
          name: 'keyword',
          type: 'text',
          label: 'Keyword',
        },
      ],
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: 'Is Featured',
    },
  ],
  timestamps: true,
}
