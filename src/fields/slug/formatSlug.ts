import type { FieldHook } from 'payload'
import { transliterate } from 'transliteration'

export const formatSlug = (val: string): string => {
  if (!val) return ''

  const transliterated = transliterate(val)

  return transliterated
    .replace(/[^\w\s-]+/g, '-') // Replace special chars with hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/(^-)|(-$)/g, '') // Remove leading/trailing hyphens
    .toLowerCase()
}

export const formatSlugHook =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    const stringValue = typeof value === 'string' ? value : undefined

    // If user provided a non-empty slug, respect it (format it) and skip auto-generation
    if (typeof stringValue === 'string' && stringValue.trim() !== '') {
      return formatSlug(stringValue)
    }

    // If creating, or slug is missing/empty, try to generate from fallback field (e.g., title)
    const slugInData = typeof data?.slug === 'string' ? data.slug : undefined
    const shouldGenerateFromFallback =
      operation === 'create' || !slugInData || slugInData.trim() === ''

    if (shouldGenerateFromFallback) {
      const fallbackData = data?.[fallback]

      if (typeof fallbackData === 'string' && fallbackData.trim() !== '') {
        return formatSlug(fallbackData)
      }
    }

    // Nothing to do; keep existing value as-is
    return value
  }
