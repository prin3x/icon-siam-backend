import type { CollectionConfig } from 'payload'

export const Stickbar: CollectionConfig = {
  slug: 'stickbar',
  labels: {
    singular: 'Stickbar',
    plural: 'Stickbars',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      localized: true,
    },
    {
      name: 'icon',
      type: 'upload',
      label: 'Icon',
      relationTo: 'media',
      localized: true,
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link',
      localized: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: ['active', 'inactive'],
      defaultValue: 'active',
      localized: true,
    },
    {
      name: 'background_color',
      type: 'text',
      label: 'Background Color',
      defaultValue: '#987b2c',
      admin: {
        components: {
          Field: '@/components/ColorPicker',
        },
      },
    },
  ],
  //   hooks: {
  //     beforeChange: [
  //       async ({ data, req, operation }) => {
  //         if (data.status === 'active') {
  //           const { docs } = await req.payload.find({
  //             collection: 'stickbar',
  //             where: { status: { equals: 'active' }, id: { not_equals: data.id } },
  //           })
  //           if (
  //             docs.length >= 2 &&
  //             (operation === 'create' || !docs.some((doc) => doc.id === data.id))
  //           ) {
  //             throw new Error('Only two stickbars can be active at a time.')
  //           }
  //         }
  //         return data
  //       },
  //     ],
  //   },
}
