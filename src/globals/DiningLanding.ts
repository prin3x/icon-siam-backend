import type { GlobalConfig } from 'payload'

export const DiningLanding: GlobalConfig = {
  slug: 'dining-landing',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Page Title',
    },
    {
      name: 'banner',
      type: 'relationship',
      relationTo: 'page-banners',
      label: 'Landing Page Banner',
      required: true,
    },
    {
      name: 'introduction',
      type: 'richText',
      localized: true,
      label: 'Introduction Content',
    },
    {
      name: 'featuredDinings',
      type: 'relationship',
      relationTo: 'dinings',
      hasMany: true,
      label: 'Featured Restaurants',
      admin: {
        description: 'Select one or more restaurants to feature on the dining landing page.',
      },
    },
  ],
}
