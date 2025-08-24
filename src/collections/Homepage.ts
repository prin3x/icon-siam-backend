import type { CollectionConfig } from 'payload'

export const Homepage: CollectionConfig = {
  slug: 'homepage',
  labels: {
    singular: 'Homepage',
    plural: 'Homepage',
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'subtitle', 'status'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
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
    },
    {
      name: 'custom_happening_title',
      type: 'text',
      label: 'Custom Happening Title',
      localized: true,
    },
    {
      name: 'custom_happening_subtitle',
      type: 'text',
      label: 'Custom Happening Subtitle',
      localized: true,
    },
    {
      name: 'custom_iconic_experience_title',
      type: 'text',
      label: 'Custom Iconic Experience Title',
      localized: true,
    },
    {
      name: 'custom_iconic_experience_subtitle',
      type: 'text',
      label: 'Custom Iconic Experience Subtitle',
      localized: true,
    },
    {
      name: 'iconic_experience',
      type: 'array',
      label: 'Iconic Experience',
      localized: true,
      fields: [
        {
          name: 'item',
          type: 'relationship',
          label: 'Showcase Item',
          relationTo: ['dinings', 'shops', 'attractions'],
          filterOptions: {
            status: { equals: 'ACTIVE' },
          },
        },
        {
          name: 'custom_title',
          type: 'text',
          label: 'Custom Title (optional)',
        },
        {
          name: 'custom_image',
          type: 'upload',
          label: 'Custom Image (optional)',
          relationTo: 'media',
        },
        {
          name: 'custom_link',
          type: 'text',
          label: 'Custom Link (optional)',
        },
      ],
    },
    {
      name: 'custom_dinings_title',
      type: 'text',
      label: 'Custom Dinings Title',
      localized: true,
    },
    {
      name: 'custom_dinings_subtitle',
      type: 'text',
      label: 'Custom Dinings Subtitle',
      localized: true,
    },
    {
      name: 'dinings',
      type: 'array',
      label: 'Savour Dinings',
      fields: [
        {
          name: 'dining',
          type: 'relationship',
          label: 'Dining',
          relationTo: 'dinings',
        },
        {
          name: 'custom_title',
          type: 'text',
          label: 'Custom Title (optional)',
          localized: true,
        },
        {
          name: 'custom_image',
          type: 'upload',
          label: 'Custom Image (optional)',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'extraordinary_shopping_title',
      type: 'text',
      label: 'Custom Extraordinary Shopping Title',
      localized: true,
    },
    {
      name: 'extraordinary_shopping_subtitle',
      type: 'text',
      label: 'Custom Extraordinary Shopping Subtitle',
      localized: true,
    },
    {
      name: 'extraordinary_shopping',
      type: 'array',
      label: 'Extraordinary Shopping',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: 'Subtitle',
        },
        {
          name: 'cover_image',
          type: 'upload',
          label: 'Cover Image',
          relationTo: 'media',
        },
        {
          name: 'path_to_page',
          type: 'text',
          label: 'Path to Page',
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
      name: 'showcase_call_to_action',
      type: 'text',
      label: 'Showcase Call to Action',
      localized: true,
    },
    {
      name: 'showcase_link',
      type: 'text',
      label: 'Showcase Link',
      localized: true,
    },
    {
      name: 'showcase_background_image',
      type: 'upload',
      label: 'Showcase Background Image',
      relationTo: 'media',
    },
    {
      name: 'onesiam_animation_text_runner',
      type: 'text',
      label: 'Onesiam Animation Text Runner',
    },
    {
      name: 'onesiam_animation_text_runner_color',
      type: 'text',
      label: 'Onesiam Animation Text Runner Color',
      defaultValue: '#ffffff',
      admin: {
        components: {
          Field: '@/components/ColorPicker',
        },
      },
    },
    {
      name: 'onesiam_member_title',
      type: 'text',
      label: 'Onesiam Member Title',
      localized: true,
    },
    {
      name: 'onesiam_member_description',
      type: 'textarea',
      label: 'Onesiam Member Description',
      localized: true,
    },
    {
      name: 'onesiam_member_image',
      type: 'upload',
      label: 'Onesiam Member Image',
      relationTo: 'media',
    },
    {
      name: 'onesiam_member_call_to_action',
      type: 'text',
      label: 'Onesiam Member Call to Action',
      localized: true,
    },
    {
      name: 'onesiam_member_link',
      type: 'text',
      label: 'Onesiam Member Link',
      localized: true,
    },
    {
      name: 'onesiam_app_title',
      type: 'text',
      label: 'Onesiam App Title',
      localized: true,
    },
    {
      name: 'onesiam_app_description',
      type: 'textarea',
      label: 'Onesiam App Description',
      localized: true,
    },
    {
      name: 'onesiam_app_image',
      type: 'upload',
      label: 'Onesiam App Image',
      relationTo: 'media',
    },
    {
      name: 'onesiam_app_background_image',
      type: 'upload',
      label: 'Onesiam App Background Image',
      relationTo: 'media',
    },
    {
      name: 'onesiam_app_background_image_mobile',
      type: 'upload',
      label: 'Onesiam App Background Image Mobile',
      relationTo: 'media',
    },
    {
      name: 'onesiam_app_call_to_action_android_link',
      type: 'text',
      label: 'Onesiam App Call to Action Android Link',
    },
    {
      name: 'onesiam_app_call_to_action_ios_link',
      type: 'text',
      label: 'Onesiam App Call to Action iOS Link',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: ['draft', 'published'],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (data.status === 'published') {
          const { docs } = await req.payload.find({
            collection: 'homepage',
            where: { status: { equals: 'published' }, id: { not_equals: data.id } },
          })
          if (docs.length > 0 && (operation === 'create' || docs?.[0]?.id !== data.id)) {
            throw new Error('Only one homepage can be published at a time.')
          }
        }
        return data
      },
    ],
  },
}
