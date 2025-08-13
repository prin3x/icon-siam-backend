import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const Attractions: CollectionConfig = {
  slug: 'attractions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'main_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Main Image URL',
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
      name: 'highlight_image_url',
      type: 'array',
      label: 'Highlight Image URL',
      fields: [
        {
          name: 'image_url',
          type: 'upload',
          relationTo: 'media',
          label: 'Image URL',
        },
      ],
    },
    {
      name: 'feature_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Feature Image URL',
    },
    {
      name: 'feature_title',
      type: 'text',
      label: 'Feature Title',
      localized: true,
    },
    {
      name: 'feature_description',
      type: 'textarea',
      label: 'Feature Description',
      localized: true,
    },
    {
      name: 'showcase_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Showcase Image URL',
    },
    {
      name: 'showcase_background_color',
      type: 'text',
      label: 'Showcase Background Color',
      defaultValue: '#000000',
      admin: {
        components: {
          Field: '@/components/ColorPicker',
        },
      },
    },
    {
      name: 'showcase_title',
      type: 'text',
      label: 'Showcase Title',
      localized: true,
    },
    {
      name: 'showcase_subtitle',
      type: 'text',
      label: 'Showcase Subtitle',
      localized: true,
    },
    {
      name: 'showcase_description',
      type: 'textarea',
      label: 'Showcase Description',
      localized: true,
    },
    {
      name: 'gallery_main_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Gallery Main Image URL',
    },
    {
      name: 'gallery_title',
      type: 'text',
      label: 'Gallery Title',
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
          relationTo: 'media',
          label: 'Image URL',
        },
      ],
    },
    {
      name: 'gallery_description',
      type: 'textarea',
      label: 'Gallery Description',
      localized: true,
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
      name: 'order',
      type: 'number',
      label: 'Order',
      required: true,
      hooks: {
        beforeChange: [
          async ({ data, req: { payload }, value, originalDoc, operation }) => {
            if (operation === 'update' && originalDoc?.order === value) {
              return value
            }

            const existingOrder = await payload.find({
              collection: 'attractions',
              where: {
                order: {
                  equals: data?.order,
                },
              },
            })

            if (existingOrder.docs.length > 0) {
              throw new Error('Order already exists')
            }

            return value
          },
        ],
      },
    },
    {
      name: 'is_featured',
      type: 'checkbox',
      label: 'Is Featured',
    },
    ...slugField(),
  ],
  timestamps: true,
}
