import type { FieldHook } from 'payload'
import { transliterate } from 'transliteration'

export const formatSlug = (val: string): string => {
  if (!val) return ''

  const transliterated = transliterate(val)

  return transliterated
    .replace(/[^\w\s-]+/g, '-') // Replace special chars with hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase()
}

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string') {
      return formatSlug(value)
    }

    if (operation === 'create' || !data?.slug) {
      const fallbackData = data?.[fallback] || data?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return formatSlug(fallbackData)
      }
    }

    return value
  }
