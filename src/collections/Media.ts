import type { CollectionConfig } from 'payload'

const useLocal = process.env.UPLOAD_STRATEGY === 'local'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: useLocal
    ? {
        staticDir: 'media',
      }
    : true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'group',
      label: 'Alt Text',
      fields: [
        {
          name: 'en',
          type: 'text',
          label: 'Alt Text (English)',
        },
        {
          name: 'th',
          type: 'text',
          label: 'Alt Text (Thai)',
        },
        {
          name: 'zh',
          type: 'text',
          label: 'Alt Text (Chinese)',
        },
      ],
    },
  ],
}
