import { slugField } from '@/fields/slug'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Stories: CollectionConfig = {
  slug: 'stories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start_date', 'end_date', 'status', 'pin_to_home', 'pin_to_section'],
    hidden: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      localized: true,
      label: 'Title',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      localized: true,
      label: 'Subtitle',
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
          localized: true,
          label: 'Cover Photo',
          relationTo: 'media',
        },
        {
          name: 'thumbnail',
          type: 'upload',
          localized: true,
          label: 'Thumbnail',
          relationTo: 'media',
        },
        {
          name: 'facebook_image',
          type: 'upload',
          localized: true,
          label: 'Facebook Image',
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
        },
        {
          name: 'related_content',
          type: 'relationship',
          label: 'Related Content',
          relationTo: ['dinings', 'shops', 'attractions', 'events', 'promotions'],
          hasMany: true,
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
