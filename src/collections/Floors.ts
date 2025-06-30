import { CollectionConfig } from 'payload'

export const Floors: CollectionConfig = {
  slug: 'floors',
  admin: {
    useAsTitle: 'name',
    description: 'Floor name',
    defaultColumns: ['name', 'order', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Floor Name', required: true },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 1,
      admin: { description: 'Lower numbers appear first.' },
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
      ],
    },
  ],
}
