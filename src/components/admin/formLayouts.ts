export type LayoutField = string // field name from schema

export type LayoutSection = {
  title: string
  description?: string
  fields: LayoutField[]
}

export type CollectionFormLayout = {
  columns?: number // default 2
  left: LayoutSection[]
  right?: LayoutSection[]
}

// Declarative per-collection form layouts used by RecordEditForm.
// This lets us group and order existing schema fields without changing the schema itself.
export const FORM_LAYOUTS: Record<string, CollectionFormLayout> = {
  homepage: {
    columns: 2,
    left: [
      {
        title: 'Homepage',
        fields: ['title', 'subtitle', 'description'],
      },
      {
        title: 'Happening',
        description: 'Section displaying the latest Events and Activities',
        fields: ['custom_happening_title', 'custom_happening_subtitle'],
      },
      {
        title: 'Iconic Experience',
        description: 'Section displaying a list of Shops and Attractions (up to 10 items)',
        fields: [
          'custom_iconic_experience_title',
          'custom_iconic_experience_subtitle',
          'iconic_experience',
        ],
      },
      {
        title: 'Dinings',
        description: 'Section displaying a list of Dinings',
        fields: ['custom_dinings_title', 'custom_dinings_subtitle', 'dinings'],
      },
      {
        title: 'Extraordinary Shopping',
        fields: [
          'extraordinary_shopping_title',
          'extraordinary_shopping_subtitle',
          'extraordinary_shopping',
        ],
      },
      {
        title: 'Showcase',
        fields: [
          'showcase_title',
          'showcase_description',
          'showcase_call_to_action',
          'showcase_link',
          'showcase_background_image',
        ],
      },
      {
        title: 'ONESIAM - Text Runner',
        fields: ['onesiam_animation_text_runner', 'onesiam_animation_text_runner_color'],
      },
      {
        title: 'ONESIAM - Member',
        fields: [
          'onesiam_member_title',
          'onesiam_member_description',
          'onesiam_member_image',
          'onesiam_member_call_to_action',
          'onesiam_member_link',
        ],
      },
      {
        title: 'ONESIAM - App',
        fields: [
          'onesiam_app_title',
          'onesiam_app_description',
          'onesiam_app_image',
          'onesiam_app_background_image',
          'onesiam_app_background_image_mobile',
          'onesiam_app_call_to_action_android_link',
          'onesiam_app_call_to_action_ios_link',
        ],
      },
    ],
    right: [
      {
        title: 'Status',
        fields: ['status'],
      },
      // If SEO fields exist in schema, they will render automatically.
      {
        title: 'SEO Setting',
        fields: ['slug', 'meta_title', 'meta_description', 'meta_keywords'],
      },
    ],
  },
}
