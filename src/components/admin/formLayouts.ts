export type LayoutField = string // field name from schema

export type LayoutSection = {
  title: string
  description?: string
  fields: LayoutField[]
  // If false, consumers should render fields inline without an extra card/section wrapper
  wrap?: boolean
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

// Minimal field type definition for dynamic layout generation
type AnyField = {
  name: string
  type: string
  label?: string
  fields?: AnyField[]
}

function isLikelySEOField(fieldName: string): boolean {
  const lowered = fieldName.toLowerCase()
  return (
    lowered === 'slug' ||
    lowered.startsWith('meta_') ||
    lowered === 'seo_title' ||
    lowered === 'seo_description' ||
    lowered === 'seo_keywords'
  )
}

function isLikelyMediaField(field: AnyField): boolean {
  const lowered = field.name.toLowerCase()
  return field.type === 'upload' || /image|banner|cover|thumbnail|media/.test(lowered)
}

function isLikelyRelationshipField(field: AnyField): boolean {
  return field.type === 'relationship'
}

function isStatusField(fieldName: string): boolean {
  return fieldName.toLowerCase() === 'status'
}

function isTextualField(field: AnyField): boolean {
  return field.type === 'text' || field.type === 'textarea' || field.type === 'richText'
}

function titleCaseFromName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildDefaultLayout(
  collectionSlug: string,
  fields: AnyField[],
): CollectionFormLayout {
  const used = new Set<string>()

  const leftSections: LayoutSection[] = []
  const rightSections: LayoutSection[] = []

  // Right: Status
  const hasStatus = fields.some((f) => isStatusField(f.name))
  if (hasStatus) {
    rightSections.push({ title: 'Status', fields: ['status'] })
    used.add('status')
  }

  // Right: SEO
  const seoFieldNames = fields.filter((f) => isLikelySEOField(f.name)).map((f) => f.name)
  if (seoFieldNames.length > 0) {
    rightSections.push({
      title: 'SEO Setting',
      fields: seoFieldNames,
    })
    seoFieldNames.forEach((n) => used.add(n))
  }

  // Left: Basic Info (common textual fields)
  const basicNames = ['title', 'subtitle', 'description'].filter((n) =>
    fields.some((f) => f.name === n),
  )
  if (basicNames.length > 0) {
    leftSections.push({ title: 'Basic Info', fields: basicNames })
    basicNames.forEach((n) => used.add(n))
  }

  // Left: Content (other textual fields)
  const contentFields = fields
    .filter(
      (f) =>
        isTextualField(f) &&
        !used.has(f.name) &&
        !isLikelySEOField(f.name) &&
        !isStatusField(f.name),
    )
    .map((f) => f.name)
  if (contentFields.length > 0) {
    leftSections.push({ title: 'Content', fields: contentFields })
    contentFields.forEach((n) => used.add(n))
  }

  // Left: Media (uploads and image-like)
  const mediaFields = fields
    .filter((f) => isLikelyMediaField(f) && !used.has(f.name))
    .map((f) => f.name)
  if (mediaFields.length > 0) {
    leftSections.push({ title: 'Media', fields: mediaFields })
    mediaFields.forEach((n) => used.add(n))
  }

  // Left: Relationships
  const relationshipFields = fields
    .filter((f) => isLikelyRelationshipField(f) && !used.has(f.name))
    .map((f) => f.name)
  if (relationshipFields.length > 0) {
    leftSections.push({ title: 'Relationships', fields: relationshipFields })
    relationshipFields.forEach((n) => used.add(n))
  }

  // Left: Structured fields (arrays/groups/tabs/rows/collapsible) – keep as their own sections
  const structuredTypes = new Set(['array', 'group', 'tabs', 'row', 'collapsible'])
  const structuredFields = fields.filter((f) => structuredTypes.has(f.type) && !used.has(f.name))
  for (const f of structuredFields) {
    const sectionTitle = f.label || titleCaseFromName(f.name)
    // Avoid extra visual nesting: render structured fields inline (no extra card wrapper)
    leftSections.push({ title: sectionTitle, fields: [f.name], wrap: false })
    used.add(f.name)
  }

  // Left: Anything else not yet placed
  const remaining = fields
    .filter((f) => !used.has(f.name) && !isLikelySEOField(f.name) && !isStatusField(f.name))
    .map((f) => f.name)
  if (remaining.length > 0) {
    leftSections.push({ title: 'Other Fields', fields: remaining })
    remaining.forEach((n) => used.add(n))
  }

  const layout: CollectionFormLayout = {
    columns: rightSections.length > 0 ? 2 : 1,
    left: leftSections,
    right: rightSections.length > 0 ? rightSections : undefined,
  }

  return layout
}

export function getLayoutForCollection(
  collectionSlug: string,
  fields: AnyField[],
): CollectionFormLayout | undefined {
  if (FORM_LAYOUTS[collectionSlug]) return FORM_LAYOUTS[collectionSlug]
  if (!fields || fields.length === 0) return undefined
  return buildDefaultLayout(collectionSlug, fields)
}
