import type { CollectionConfig } from 'payload'

export const PageBanners: CollectionConfig = {
  slug: 'page-banners',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'custom_title',
    defaultColumns: ['placement_key', 'active_start_date', 'active_end_date', 'display_order'],
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
          label: 'Promotions',
          value: 'PROMOTIONS',
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
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
    },
    {
      name: 'linked_event',
      type: 'relationship',
      relationTo: 'events',
      label: 'Linked Event',
    },
    {
      name: 'custom_title',
      type: 'text',
      localized: true,
      label: 'Custom Title',
    },
    {
      name: 'custom_subtitle',
      type: 'textarea',
      localized: true,
      label: 'Custom Subtitle',
    },
    {
      name: 'first_section_title',
      type: 'text',
      label: 'Section Title',
      localized: true,
    },
    {
      name: 'first_section_subtitle',
      type: 'textarea',
      label: 'Section Subtitle',
      localized: true,
    },
    {
      name: 'custom_image_url',
      type: 'upload',
      relationTo: 'media',
      label: 'Custom Image',
    },
    {
      name: 'custom_banner_images',
      localized: true,
      type: 'array',
      label: 'Custom Banner Images',
      fields: [
        {
          name: 'banner_image',
          type: 'upload',
          label: 'Banner Image',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'custom_image_alt_text',
      type: 'text',
      localized: true,
      label: 'Custom Image Alt Text',
    },
    {
      name: 'call_to_action_text',
      type: 'text',
      localized: true,
      label: 'Call To Action Text',
    },
    {
      name: 'target_url',
      type: 'text',
      localized: true,
      label: 'Target URL',
    },
    {
      name: 'custom_banner_section_title',
      type: 'text',
      localized: true,
      label: 'Custom Banner Section Title',
    },
    {
      name: 'custom_banner_section_subtitle',
      type: 'textarea',
      localized: true,
      label: 'Custom Banner Section Subtitle',
    },
    {
      name: 'status',
      type: 'select',
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
      defaultValue: 'ACTIVE',
    },
  ],
  timestamps: true,
}
