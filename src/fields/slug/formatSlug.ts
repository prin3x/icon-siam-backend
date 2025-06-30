import type { FieldHook } from 'payload'
import { transliterate } from 'transliteration'

export const formatSlug = (val: string): string => {
  // First transliterate the text to handle non-English characters
  const transliterated = transliterate(val)
  // Then format the slug
  return transliterated
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
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
