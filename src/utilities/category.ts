import { Category } from '@/payload-types'

export function getCategoryNames(categories?: (number | Category)[] | null): string[] {
  if (!categories) return []
  return categories
    .map((cat) => (typeof cat === 'object' ? cat.name : cat.toString()))
    .filter((name): name is string => name != null)
}
