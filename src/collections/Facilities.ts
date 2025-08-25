import type { CollectionConfig } from 'payload'

export const Facilities: CollectionConfig = {
  slug: 'facilities',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Facilities',
      localized: true,
    },
    {
      name: 'banner_image',
      type: 'upload',
      label: 'Banner Image',
      relationTo: 'media',
    },
    {
      name: 'bank_section',
      type: 'group',
      label: 'Bank Section',
      fields: [
        {
          name: 'section_name',
          localized: true,
          type: 'text',
          label: 'Section Name',
        },
        {
          name: 'section_contents',
          type: 'relationship',
          label: 'Section Contents',
          relationTo: 'shops',
          hasMany: true,
          admin: {
            description: 'Select the shop to be displayed in the section',
          },
        },
      ],
    },
    {
      name: 'post_office_section',
      type: 'group',
      label: 'Post Office Section',
      fields: [
        {
          name: 'section_name',
          localized: true,
          type: 'text',
          label: 'Section Name',
        },
        {
          name: 'section_contents',
          type: 'relationship',
          label: 'Section Contents',
          relationTo: 'shops',
          hasMany: true,
          admin: {
            description: 'Select the shop to be displayed in the section',
          },
        },
      ],
    },

    {
      name: 'services',
      type: 'array',
      label: 'Services',
      localized: true,
      fields: [
        {
          name: 'image_icon',
          type: 'upload',
          label: 'Image Icon',
          relationTo: 'media',
        },
        {
          name: 'service_name',
          type: 'text',
          label: 'Service Name',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'floor',
          type: 'relationship',
          label: 'Floor',
          relationTo: 'floors',
          hasMany: true,
        },
        {
          name: 'location_zone',
          type: 'text',
          label: 'Location Zone',
        },
      ],
    },
    {
      name: 'facilities',
      type: 'array',
      label: 'Facilities',
      localized: true,
      fields: [
        {
          name: 'image_icon',
          type: 'upload',
          label: 'Image Icon',
          relationTo: 'media',
        },
        {
          name: 'facility_name',
          type: 'text',
          label: 'Facility Name',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'floor',
          type: 'relationship',
          label: 'Floor',
          relationTo: 'floors',
          hasMany: true,
        },
        {
          name: 'location_zone',
          type: 'text',
          label: 'Location Zone',
        },
      ],
    },
  ],
  timestamps: true,
}
