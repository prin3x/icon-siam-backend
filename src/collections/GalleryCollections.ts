import { CollectionConfig } from 'payload'

export const GalleryCollections: CollectionConfig = {
  slug: 'gallery-collections',
  admin: {
    useAsTitle: 'placement_key',
    defaultColumns: ['placement_key', 'title'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'placement_key',
      type: 'select',
      required: true,
      label: 'Placement Key',
      unique: true,
      options: [
        {
          label: 'Homepage',
          value: 'HOMEPAGE',
        },
        {
          label: 'About',
          value: 'ABOUT',
        },
        {
          label: 'Dining',
          value: 'DINING',
        },
        {
          label: 'Shopping',
          value: 'SHOPPING',
        },
        {
          label: 'Events & Activities',
          value: 'EVENTS',
        },
        {
          label: 'Getting Here',
          value: 'GETTING_HERE',
        },
        {
          label: 'Directory',
          value: 'DIRECTORY',
        },
        {
          label: 'Icon Craft',
          value: 'ICON_CRAFT',
        },
        {
          label: 'Icon Luxe',
          value: 'ICON_LUXE',
        },
        {
          label: 'Attraction',
          value: 'ATTRACTION',
        },
        {
          label: 'New & Press',
          value: 'NEWS',
        },
        {
          label: 'The Stories',
          value: 'STORIES',
        },
        {
          label: 'Facilities',
          value: 'FACILITIES',
        },
        {
          label: 'Residences',
          value: 'RESIDENCES',
        },
        {
          label: 'Tenant Services',
          value: 'TENANT_SERVICES',
        },
        {
          label: 'Vision & Mission',
          value: 'VISION_AND_MISSION',
        },
        {
          label: 'Board of Directors',
          value: 'BOARD_OF_DIRECTORS',
        },
        {
          label: 'Awards',
          value: 'AWARDS',
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Title',
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: 'Description',
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
  ],
}
