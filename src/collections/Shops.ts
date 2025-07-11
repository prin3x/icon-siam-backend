import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const Shops: CollectionConfig = {
  slug: 'shops',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start_date', 'end_date', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'unique_id',
      type: 'text',
      label: 'Unique ID',
      admin: {
        disabled: true,
      },
    },
    {
      name: 'title',
      localized: true,
      type: 'textarea',
      label: 'Title',
    },
    {
      name: 'pin_to_iconluxe',
      type: 'checkbox',
      label: 'Pin to Iconluxe',
      defaultValue: false,
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
      name: 'categories',
      type: 'relationship',
      label: 'Categories',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Select categories this shop belongs to',
      },
      filterOptions: {
        type: {
          equals: 'shops',
        },
      },
    },
    {
      name: 'floor',
      type: 'relationship',
      label: 'Floor',
      relationTo: 'floors',
    },
    {
      name: 'location_zone',
      type: 'text',
      label: 'Location Zone',
    },
    {
      name: 'location_shop_number',
      type: 'text',
      localized: true,
      label: 'Location Shop Number',
    },
    {
      name: 'location_coordinates',
      type: 'group',
      label: 'Location Coordinates',
      fields: [
        {
          name: 'poi_x',
          type: 'number',
          label: 'POI X Coordinate',
          defaultValue: 0,
        },
        {
          name: 'poi_y',
          type: 'number',
          label: 'POI Y Coordinate',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'opening_hours',
      type: 'group',
      label: 'Opening Hours',
      fields: [
        {
          name: 'same_hours_every_day',
          type: 'checkbox',
          label: 'Same hours every day',
          defaultValue: true,
        },
        {
          name: 'open',
          type: 'text',
          label: 'Open Time',
          admin: { placeholder: '10:00' },
        },
        {
          name: 'close',
          type: 'text',
          label: 'Close Time',
          admin: { placeholder: '22:00' },
        },
        {
          name: 'per_day',
          type: 'array',
          label: 'Per Day Hours (if different)',
          admin: {
            condition: (data, siblingData) => !siblingData.same_hours_every_day,
          },
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Mon', value: 'mon' },
                { label: 'Tue', value: 'tue' },
                { label: 'Wed', value: 'wed' },
                { label: 'Thu', value: 'thu' },
                { label: 'Fri', value: 'fri' },
                { label: 'Sat', value: 'sat' },
                { label: 'Sun', value: 'sun' },
              ],
            },
            {
              name: 'open',
              type: 'text',
              required: true,
              label: 'Open Time',
            },
            {
              name: 'close',
              type: 'text',
              required: true,
              label: 'Close Time',
            },
          ],
        },
      ],
    },
    {
      name: 'contact_info',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'website',
          type: 'text',
          label: 'Website',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone',
        },
        {
          name: 'instagram_url',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'facebook_url',
          type: 'text',
          label: 'Facebook URL',
        },
        {
          name: 'wechat_account',
          type: 'text',
          label: 'WeChat Account',
        },
        {
          name: 'line_account',
          type: 'text',
          label: 'Line Account',
        },
        {
          name: 'weibo_url',
          type: 'text',
          label: 'Weibo URL',
        },
      ],
    },
    {
      name: 'images',
      type: 'group',
      label: 'Images',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          label: 'Logo Image',
          relationTo: 'media',
        },
        {
          name: 'main_image',
          type: 'upload',
          label: 'Main Image',
          relationTo: 'media',
        },
        {
          name: 'thumbnail',
          type: 'upload',
          label: 'Thumbnail Image',
          relationTo: 'media',
        },
        {
          name: 'facebook_image',
          type: 'upload',
          label: 'Facebook Image',
          relationTo: 'media',
        },
        {
          name: 'gallery',
          type: 'array',
          label: 'Gallery Images',
          fields: [
            {
              name: 'image',
              type: 'upload',
              label: 'Image',
              relationTo: 'media',
            },
          ],
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
        {
          label: 'Closed',
          value: 'CLOSED',
        },
        {
          label: 'Temporarily Closed',
          value: 'TEMPORARILY_CLOSED',
        },
        {
          label: 'Coming Soon',
          value: 'COMING_SOON',
        },
      ],
    },
    {
      name: 'date_range',
      type: 'group',
      label: 'Date Range',
      fields: [
        {
          name: 'start_date',
          type: 'date',
          label: 'Start Date',
        },
        {
          name: 'end_date',
          type: 'date',
          label: 'End Date',
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
    ...slugField(),
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
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
        },
      ],
    },
    {
      name: 'related_content',
      type: 'relationship',
      label: 'Related Content',
      relationTo: ['dinings', 'shops', 'promotions'],
      hasMany: true,
    },
    {
      name: 'related_promotions',
      type: 'relationship',
      label: 'Related Promotions',
      relationTo: 'promotions',
      hasMany: true,
    },
    {
      name: 'short_alphabet',
      type: 'text',
      label: 'Short Alphabet',
      admin: {
        description: 'Short alphabet identifier for quick reference',
      },
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: 'Is Featured',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sort Order',
      admin: {
        description: 'Custom sort order (lower numbers appear first)',
      },
    },
  ],
  timestamps: true,
}
