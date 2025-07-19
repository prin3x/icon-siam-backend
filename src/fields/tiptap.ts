import type { Field } from 'payload'

export const tiptapField = (): Field => ({
  name: 'content',
  type: 'richText',
  label: 'Content',
  admin: {
    components: {
      Field: 'RichTextEditor',
    },
  },
})
