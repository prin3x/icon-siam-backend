import { getPayload } from 'payload'
import config from '../payload.config'

type StoryDoc = {
  id: string | number
  relationships?: {
    categories?: Array<string | number>
  }
  system?: {
    cid?: string | number | null
  }
}

const CATEGORY_NAME_BY_CID: Record<string, string> = {
  '1': 'SHOPPING',
  '2': 'DINING',
  '3': 'LIFESTYLE',
}

async function resolveCategoryIdByName(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string,
): Promise<number | null> {
  // Try English first
  const tryLocales = ['en', 'th', 'zh'] as const
  for (const locale of tryLocales) {
    try {
      const byEquals = await payload.find({
        collection: 'categories',
        where: {
          and: [{ type: { equals: 'stories' } }, { name: { equals: name } }],
        },
        limit: 1,
        locale,
        depth: 0,
      })
      if (byEquals.docs.length > 0) return Number(byEquals.docs[0].id)
    } catch {}
    try {
      const byLike = await payload.find({
        collection: 'categories',
        where: {
          and: [{ type: { equals: 'stories' } }, { name: { like: name } }],
        },
        limit: 1,
        locale,
        depth: 0,
      })
      if (byLike.docs.length > 0) return Number(byLike.docs[0].id)
    } catch {}
  }
  return null
}

async function patchStoriesCategories() {
  const payload = await getPayload({ config })

  let page = 1
  const limit = 100
  let totalPages = 1
  let updated = 0
  let skipped = 0

  const categoryCache = new Map<string, number | null>()

  console.log('Starting stories categories patch using system.cid mapping...')

  while (page <= totalPages) {
    const res = await payload.find({
      collection: 'stories',
      page,
      limit,
      depth: 0,
    })

    totalPages = res.totalPages || 1
    console.log(`Processing page ${res.page}/${totalPages} — ${res.docs.length} stories`)

    for (const doc of res.docs as unknown as StoryDoc[]) {
      const cidRaw = doc.system?.cid
      const cidKey = cidRaw == null ? '' : String(cidRaw).trim()

      if (cidKey === '4') {
        console.log(
          `↪ Story id=${doc.id} has cid=4 and should belong to news-press. Skipping in stories patch.`,
        )
        skipped++
        continue
      }

      const categoryName = CATEGORY_NAME_BY_CID[cidKey] || 'OTHERS'

      if (!categoryCache.has(categoryName)) {
        const catId = await resolveCategoryIdByName(payload, categoryName)
        categoryCache.set(categoryName, catId)
      }

      const categoryId = categoryCache.get(categoryName)
      if (!categoryId) {
        console.warn(`Category not found for name="${categoryName}". Story id=${doc.id} skipped.`)
        skipped++
        continue
      }

      const existing: number[] = Array.isArray(doc.relationships?.categories)
        ? (doc.relationships!.categories as Array<any>)
            .map((v) => {
              if (v && typeof v === 'object' && 'id' in v) return Number((v as any).id)
              return Number(v)
            })
            .filter((n) => Number.isFinite(n))
        : []

      if (existing.includes(Number(categoryId))) {
        // Nothing to change
        continue
      }

      const nextIds: number[] = [...existing, Number(categoryId)]

      try {
        await payload.update({
          collection: 'stories',
          id: String(doc.id),
          data: {
            relationships: {
              categories: nextIds,
            },
          },
        })
        updated++
        console.log(`✔ Updated story id=${doc.id} → +category(${categoryName})`)
      } catch (e) {
        skipped++
        console.error(`✖ Failed updating story id=${doc.id}:`, e)
      }
    }

    page++
  }

  console.log('— Patch summary —')
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
}

patchStoriesCategories()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
