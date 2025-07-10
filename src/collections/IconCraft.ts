import type { CollectionConfig } from 'payload'

export const IconCraft: CollectionConfig = {
  slug: 'icon-craft',
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
      name: 'content',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'image_url',
          type: 'upload',
          label: 'Image URL',
          relationTo: 'media',
        },
      ],
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
      name: 'craft_highlight_title',
      type: 'text',
      label: 'Craft Highlight Title',
      localized: true,
    },
    {
      name: 'craft_highlight_description',
      type: 'text',
      label: 'Craft Highlight Description',
      localized: true,
    },
    {
      name: 'craft_highlight_content',
      type: 'array',
      label: 'Craft Highlight Content',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          localized: true,
        },
        {
          name: 'image_url',
          type: 'upload',
          relationTo: 'media',
          label: 'Image URL',
        },
      ],
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
