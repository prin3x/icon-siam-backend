import { slugField } from '@/fields/slug'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start_date', 'end_date', 'status', 'is_featured'],
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
      required: true,
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
      admin: {
        description: 'Short highlight text for the event',
      },
    },
    {
      name: 'section_highlight',
      type: 'textarea',
      label: 'Section Highlight',
      admin: {
        description: 'Highlight text for specific sections',
      },
    },
    {
      name: 'short_alphabet',
      type: 'text',
      label: 'Short Alphabet',
      admin: {
        description: 'Short alphabetical identifier',
      },
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
      admin: {
        description: 'Time when the event/show takes place',
      },
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
      name: 'is_featured',
      type: 'checkbox',
      label: 'Is Featured',
      defaultValue: false,
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sort Order',
      admin: {
        description: 'Order for displaying events',
      },
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
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Location Name',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Location Address',
        },
        {
          name: 'floor',
          type: 'relationship',
          label: 'Floor',
          relationTo: 'floors',
        },
        {
          name: 'zone',
          type: 'text',
          label: 'Zone',
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
          admin: {
            description: 'Select categories this event belongs to',
          },
          filterOptions: {
            type: {
              equals: 'events',
            },
          },
        },
        {
          name: 'related_content',
          type: 'relationship',
          label: 'Related Content',
          relationTo: ['dinings', 'shops', 'attractions'],
          hasMany: true,
          admin: {
            description: 'Related dining, shops, or attractions',
          },
        },
        {
          name: 'related_promotions',
          type: 'relationship',
          label: 'Related Promotions',
          relationTo: 'promotions',
          hasMany: true,
          admin: {
            description: 'Related promotions',
          },
        },
      ],
    },
    {
      name: 'promotion_type',
      type: 'select',
      label: 'Promotion Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Special Offer',
          value: 'special_offer',
        },
        {
          label: 'Discount',
          value: 'discount',
        },
        {
          label: 'Event',
          value: 'event',
        },
        {
          label: 'Sale',
          value: 'sale',
        },
      ],
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
      admin: {
        description: 'Internal system fields',
        readOnly: true,
      },
      fields: [
        {
          name: 'original_id',
          type: 'number',
          label: 'Original MySQL ID',
        },
        {
          name: 'cid',
          type: 'number',
          label: 'Category ID',
        },
        {
          name: 'scid',
          type: 'number',
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
