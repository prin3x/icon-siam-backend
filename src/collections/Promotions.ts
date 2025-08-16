import { slugField } from '@/fields/slug'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start_date', 'end_date', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
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
      hidden: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: 'Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
    {
      name: 'highlight',
      type: 'textarea',
      label: 'Highlight',
    },
    {
      name: 'section_highlight',
      type: 'textarea',
      label: 'Section Highlight',
    },
    {
      name: 'short_alphabet',
      type: 'text',
      label: 'Short Alphabet',
    },
    {
      name: 'start_date',
      type: 'date',
      required: true,
      label: 'Start Date',
    },
    {
      name: 'end_date',
      type: 'date',
      required: true,
      label: 'End Date',
    },
    {
      name: 'show_time',
      type: 'text',
      label: 'Show Time',
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
      name: 'pin_to_home',
      type: 'checkbox',
      label: 'Pin to Home',
      defaultValue: false,
    },
    {
      name: 'pin_to_section',
      type: 'checkbox',
      label: 'Pin to Section',
      defaultValue: false,
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sort Order',
    },
    {
      name: 'images',
      type: 'group',
      label: 'Images',
      fields: [
        {
          name: 'cover_photo',
          type: 'upload',
          label: 'Cover Photo',
          localized: true,
          relationTo: 'media',
        },
        {
          name: 'thumbnail',
          type: 'upload',
          label: 'Thumbnail',
          localized: true,
          relationTo: 'media',
        },
        {
          name: 'facebook_image',
          type: 'upload',
          label: 'Facebook Image',
          localized: true,
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'relationships',
      type: 'group',
      label: 'Relationships',
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          label: 'Categories',
          relationTo: 'categories',
          hasMany: true,
          filterOptions: {
            type: {
              equals: 'promotions',
            },
            status: { equals: 'ACTIVE' },
          },
        },
        {
          name: 'related_content',
          type: 'relationship',
          label: 'Related Content',
          relationTo: ['dinings', 'shops', 'attractions', 'events'],
          hasMany: true,
        },
      ],
    },
    {
      name: 'promotion_type',
      type: 'text',
      label: 'Promotion Type',
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
        {
          name: 'keywords',
          type: 'textarea',
          localized: true,
          label: 'Meta Keywords',
        },
      ],
    },
    {
      name: 'system',
      type: 'group',
      label: 'System Information',
      admin: { readOnly: true },
      fields: [
        {
          name: 'original_id',
          type: 'number',
          label: 'Original MySQL ID',
        },
        {
          name: 'cid',
          type: 'text',
          label: 'Category ID',
        },
        {
          name: 'scid',
          type: 'text',
          label: 'Subcategory ID',
        },
        {
          name: 'create_by',
          type: 'text',
          label: 'Created By',
        },
        {
          name: 'modified_at',
          type: 'date',
          label: 'Last Modified',
        },
      ],
    },
    ...slugField(),
  ],
  timestamps: true,
}
