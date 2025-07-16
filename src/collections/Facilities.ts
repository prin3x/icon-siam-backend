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
          type: 'array',
          label: 'Section Contents',
          fields: [
            {
              name: 'shop',
              type: 'relationship',
              label: 'Shop',
              relationTo: 'shops',
              hasMany: true,
              admin: {
                description: 'Select the shop to be displayed in the section',
              },
            },
          ],
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
          type: 'array',
          label: 'Section Contents',
          fields: [
            {
              name: 'shop',
              type: 'relationship',
              label: 'Shop',
              relationTo: 'shops',
              hasMany: true,
              admin: {
                description: 'Select the shop to be displayed in the section',
              },
            },
          ],
        },
      ],
    },

    {
      name: 'services',
      type: 'array',
      label: 'Services',
      fields: [
        {
          name: 'image_icon',
          type: 'upload',
          label: 'Image Icon',
          relationTo: 'media',
        },
        {
          name: 'service_name',
          localized: true,
          type: 'text',
          label: 'Service Name',
        },
        {
          name: 'description',
          localized: true,
          type: 'text',
          label: 'Description',
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
      ],
    },

    {
      name: 'Facilities',
      type: 'array',
      label: 'Facilities',
      fields: [
        {
          name: 'image_icon',
          type: 'upload',
          label: 'Image Icon',
          relationTo: 'media',
        },
        {
          name: 'facility_name',
          localized: true,
          type: 'text',
          label: 'Facility Name',
        },
        {
          name: 'description',
          localized: true,
          type: 'text',
          label: 'Description',
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
      ],
    },
  ],
  timestamps: true,
}
