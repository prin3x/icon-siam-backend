import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'
import path from 'path'

interface PromotionsTableRecord {
  id: number
  slug: string
  title_th: string
  title_en: string
  title_cn: string
  sub_title_th: string
  sub_title_en: string
  sub_title_cn: string
  url_slug_th: string
  url_slug_en: string
  url_slug_cn: string
  description_th: string
  description_en: string
  description_cn: string
  seo_keyword_th: string
  seo_keyword_en: string
  seo_keyword_cn: string
  seo_desc_th: string
  seo_desc_en: string
  seo_desc_cn: string
  text_th: string
  text_en: string
  text_cn: string
  cid: string
  scid: string
  image_thumbnail: string
  cover_photo: string
  image_thumbnail_en: string
  cover_photo_en: string
  image_thumbnail_cn: string
  cover_photo_cn: string
  highlight: string
  section_highlight: string
  short_alphabet: string
  related_content: string
  promotion_type: string
  tags: string
  related_content_promotion: string
  create_by: string
  facebook_image_url: string
  facebook_image_url_en: string
  facebook_image_url_cn: string
  showDateStart: string
  showDateEnd: string
  showTime: string
  created_at: string
  modified_at: string
  start_date: string
  end_date: string
  active: number
  pin_to_home: number
  pin_to_section: number
  sort: number
}

// Utility to decode HTML entities and unicode escapes
function decodeText(text: string | null | undefined): string {
  if (!text) return ''
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  }

  let decoded = text
  const entityRegex = /&[a-zA-Z0-9#]+;/g
  let prev
  do {
    prev = decoded
    decoded = prev.replace(entityRegex, (entity) => htmlEntities[entity] || entity)
  } while (prev !== decoded)

  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  )
  return decoded
}

// Utility to convert plain text to Lexical richText structure
function textToLexical(text: string): any {
  if (!text || text.trim() === '') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                mode: 'normal',
                text: '',
                type: 'text',
                style: '',
                detail: 0,
                format: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
          },
        ],
        direction: 'ltr',
      },
    }
  }

  const decodedText = decodeText(text)

  const paragraphs = decodedText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .split('\n')
    .map((p) => {
      return p.replace(/<[^>]*>?/gm, '').trim()
    })
    .filter((p) => p.length > 0)

  const children = paragraphs.map((paragraph) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        mode: 'normal',
        text: paragraph,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
  }))

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: children.length
        ? children
        : [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: '' }],
            },
          ],
      direction: 'ltr',
    },
  }
}

async function migratePromotionsTable() {
  const payload = await getPayload({ config })

  try {
    console.log('=== Starting Promotions Migration ===')

    const promotionsDataPath = path.join(process.cwd(), 'data', 'promotions-table-export-2.json')
    const promotionsData = JSON.parse(fs.readFileSync(promotionsDataPath, 'utf8'))
    console.log(`Found ${promotionsData.length} promotions to migrate`)

    const mediaMap = new Map<string, string>()
    const categoryMap = new Map<string, string>()

    async function findOrCreateCategory(
      cid: string | number,
      type: 'events' | 'promotions',
    ): Promise<string | null> {
      if (!cid) return null
      const cidStr = cid.toString()

      if (categoryMap.has(cidStr)) {
        return categoryMap.get(cidStr)!
      }

      const categoryMapper: { [key: string]: string } = {
        'brand-promotion': 'BRAND PROMOTION',
        'tourist-privileges': 'TOURIST PRIVILEGES',
        'viz-card': 'Viz Card',
        'bank-credit-cards': 'BANK & CREDIT CARDS',
        storewide: 'STOREWIDE',
      }

      try {
        // Find existing category
        const existingCategory = await payload.find({
          collection: 'categories',
          where: {
            name: {
              equals: categoryMapper[cidStr] || cidStr.toUpperCase(),
            },
            type: {
              equals: type,
            },
          },
          limit: 1,
        })

        if (existingCategory.docs.length > 0) {
          const catId = existingCategory.docs[0]?.id
          categoryMap.set(cidStr, catId?.toString() || '')
          return catId?.toString() || ''
        }

        // Create new category if not found
        // Handle non-numeric cid values by creating a sanitized slug
        let categoryName: string
        let categorySlug: string

        if (isNaN(Number(cidStr))) {
          // For non-numeric cid values, use the cid as the name and create a sanitized slug
          categoryName = cidStr
          categorySlug = `${type}-${cidStr
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')}`
        } else {
          // For numeric cid values, use the original logic
          categoryName = `${type.charAt(0).toUpperCase() + type.slice(1)} Category ${cidStr}`
          categorySlug = `${type}-category-${cidStr}`
        }

        const newCategory = await payload.create({
          collection: 'categories',
          data: {
            name: categoryName,
            slug: categorySlug,
            type: type,
            original_id: cidStr,
            status: 'ACTIVE',
          },
        })

        console.log(`✅ Created category: ${categoryName} (slug: ${categorySlug})`)
        categoryMap.set(cidStr, newCategory.id.toString())
        return newCategory.id.toString()
      } catch (error) {
        console.error(`❌ Error finding or creating category for cid ${cidStr}:`, error)
        return null
      }
    }

    async function createMediaRecord(imageUrl: string): Promise<string | null> {
      if (!imageUrl || imageUrl.trim() === '') return null
      if (mediaMap.has(imageUrl)) {
        return mediaMap.get(imageUrl)!
      }

      try {
        const filename = imageUrl.split('/').pop() || `promotion-image-${Date.now()}.jpg`

        // Check if media with this URL already exists (more reliable than filename)
        const existingMediaByUrl = await payload.find({
          collection: 'media',
          where: {
            url: {
              equals: imageUrl,
            },
          },
          limit: 1,
        })

        if (existingMediaByUrl.docs.length > 0) {
          // Use existing media record by URL
          const existingId = existingMediaByUrl.docs[0]?.id?.toString()
          if (existingId) {
            mediaMap.set(imageUrl, existingId)
            console.log(`Reused existing media by URL: ${filename} (ID: ${existingId})`)
            return existingId
          }
        }

        // Check if media with this filename already exists
        const existingMedia = await payload.find({
          collection: 'media',
          where: {
            filename: {
              equals: filename,
            },
          },
          limit: 1,
        })

        if (existingMedia.docs.length > 0) {
          // Use existing media record
          const existingId = existingMedia.docs[0]?.id?.toString()
          if (existingId) {
            mediaMap.set(imageUrl, existingId)
            console.log(`Reused existing media by filename: ${filename} (ID: ${existingId})`)
            return existingId
          }
        }

        // Create new media record
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: { en: filename, th: filename, zh: filename },
            filename: filename,
            url: imageUrl,
            width: 800,
            height: 600,
            mimeType: 'image/jpeg',
            filesize: 0,
          },
        })
        mediaMap.set(imageUrl, media.id.toString())
        console.log(`Created new media: ${filename} (ID: ${media.id})`)
        return media.id.toString()
      } catch (error) {
        console.error(`Error creating media record for ${imageUrl}:`, error)
        return null
      }
    }

    let promotionsCreated = 0
    let promotionsUpdated = 0
    let errorCount = 0

    for (const record of promotionsData) {
      try {
        console.log(`Processing promotion: ${record.title_en || record.title_th || record.id}`)

        const parseDate = (dateStr: string) => {
          if (!dateStr || dateStr.trim() === '') return null
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]
        }

        // Create media records for images
        const imageThumbnailId_th = await createMediaRecord(record.image_thumbnail)
        const imageThumbnailId_en = await createMediaRecord(record.image_thumbnail_en)
        const imageThumbnailId_cn = await createMediaRecord(record.image_thumbnail_cn)
        const coverPhotoId_th = await createMediaRecord(record.cover_photo)
        const coverPhotoId_en = await createMediaRecord(record.cover_photo_en)
        const coverPhotoId_cn = await createMediaRecord(record.cover_photo_cn)
        const facebookImageId_th = await createMediaRecord(record.facebook_image_url)
        const facebookImageId_en = await createMediaRecord(record.facebook_image_url_en)
        const facebookImageId_cn = await createMediaRecord(record.facebook_image_url_cn)

        const categoryId = await findOrCreateCategory(record.cid, 'promotions')

        const status = record.active === 1 ? ('ACTIVE' as const) : ('INACTIVE' as const)

        const keywordsArray = []
        if (record.tags) {
          const tags = decodeText(record.tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
          keywordsArray.push(...tags.map((tag) => ({ keyword: tag })))
        }

        // Create promotion data (only if English title exists)
        let promotionData = null
        if (record.title_en && record.title_en.trim()) {
          promotionData = {
            title: decodeText(record.title_en),
            subtitle: decodeText(record.sub_title_en),
            description: decodeText(record.description_en),
            content: textToLexical(record.text_en),
            highlight: decodeText(record.highlight || ''),
            section_highlight: decodeText(record.section_highlight || ''),
            short_alphabet: decodeText(record.short_alphabet || ''),
            start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
            end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
            show_time: decodeText(record.showTime || ''),
            status: status,
            pin_to_home: record.pin_to_home === 1,
            pin_to_section: record.pin_to_section === 1,
            sort_order: record.sort || 0,
            images: {
              cover_photo: coverPhotoId_en ? parseInt(coverPhotoId_en) : null,
              thumbnail: imageThumbnailId_en ? parseInt(imageThumbnailId_en) : null,
              facebook_image: facebookImageId_en ? parseInt(facebookImageId_en) : null,
            },
            relationships: {
              categories: categoryId ? [parseInt(categoryId)] : [],
              related_content: [],
            },
            promotion_type: record.promotion_type || '',
            keywords: keywordsArray,
            meta: {
              title: decodeText(record.seo_desc_en),
              description: decodeText(record.seo_desc_en),
              keywords: decodeText(record.seo_keyword_en),
            },
            system: {
              original_id: record.id,
              cid: record.cid || null,
              scid: record.scid || null,
              create_by: decodeText(record.create_by || ''),
              modified_at: parseDate(record.modified_at),
            },
            slug: record.slug || `promotion-${record.id}`,
          }
        }

        // Check if promotion record already exists by slug first (more reliable)
        const existingPromotionBySlug = await payload.find({
          collection: 'promotions',
          where: {
            slug: {
              equals: record.slug || `promotion-${record.id}`,
            },
          },
          limit: 1,
        })

        if (existingPromotionBySlug.docs.length > 0) {
          // Update existing promotion record found by slug
          const existingId = existingPromotionBySlug.docs[0]?.id
          if (!existingId) {
            console.error(
              `Error: Existing promotion record found by slug but no ID available for: ${record.slug || `promotion-${record.id}`}`,
            )
            continue
          }

          // Update English locale only if we have English content
          if (promotionData) {
            await payload.update({
              collection: 'promotions',
              id: existingId,
              data: promotionData,
              locale: 'en',
            })
            console.log(
              `Updated English locale for promotion: ${record.title_en} (${record.slug || `promotion-${record.id}`})`,
            )
          } else {
            console.log(
              `⏭️ Skipping English locale for promotion ${record.id}: No English title available`,
            )
          }

          // Update with Thai content
          if (record.title_th) {
            await payload.update({
              collection: 'promotions',
              id: existingId,
              data: {
                title: decodeText(record.title_th),
                subtitle: decodeText(record.sub_title_th),
                description: decodeText(record.description_th),
                content: textToLexical(record.text_th),
                images: {
                  cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                  thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                  facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                },
                meta: {
                  title: decodeText(record.seo_desc_th),
                  description: decodeText(record.seo_desc_th),
                  keywords: decodeText(record.seo_keyword_th),
                },
              },
              locale: 'th',
            })
            console.log(
              `Updated Thai locale for promotion: ${record.title_th} (${record.slug || `promotion-${record.id}`})`,
            )
          }

          // Update with Chinese content
          if (record.title_cn) {
            await payload.update({
              collection: 'promotions',
              id: existingId,
              data: {
                title: decodeText(record.title_cn),
                subtitle: decodeText(record.sub_title_cn),
                description: decodeText(record.description_cn),
                content: textToLexical(record.text_cn),
                images: {
                  cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                  thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                  facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                },
                meta: {
                  title: decodeText(record.seo_desc_cn),
                  description: decodeText(record.seo_desc_cn),
                  keywords: decodeText(record.seo_keyword_cn),
                },
              },
              locale: 'zh',
            })
            console.log(
              `Updated Chinese locale for promotion: ${record.title_cn} (${record.slug || `promotion-${record.id}`})`,
            )
          }

          promotionsUpdated++
          console.log(
            `Updated existing promotion by slug: ${record.title_en || record.title_th || 'Untitled'} (${record.slug || `promotion-${record.id}`})`,
          )
        } else {
          // Check if promotion record already exists by English title (only if we have English content)
          let existingPromotion = null
          if (promotionData) {
            existingPromotion = await payload.find({
              collection: 'promotions',
              where: {
                title: {
                  equals: decodeText(record.title_en),
                },
              },
              locale: 'en',
              limit: 1,
            })
          }

          if (existingPromotion && existingPromotion.docs.length > 0) {
            // Update existing promotion record found by title
            const existingId = existingPromotion.docs[0]?.id
            if (!existingId) {
              console.error(
                `Error: Existing promotion record found by title but no ID available for: ${record.title_en}`,
              )
              continue
            }

            // Update English locale
            await payload.update({
              collection: 'promotions',
              id: existingId,
              data: promotionData!,
              locale: 'en',
            })

            // Update with Thai content
            if (record.title_th) {
              await payload.update({
                collection: 'promotions',
                id: existingId,
                data: {
                  title: decodeText(record.title_th),
                  subtitle: decodeText(record.sub_title_th),
                  description: decodeText(record.description_th),
                  content: textToLexical(record.text_th),
                  images: {
                    cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                    thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                    facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                  },
                  meta: {
                    title: decodeText(record.seo_desc_th),
                    description: decodeText(record.seo_desc_th),
                    keywords: decodeText(record.seo_keyword_th),
                  },
                },
                locale: 'th',
              })
            }

            // Update with Chinese content
            if (record.title_cn) {
              await payload.update({
                collection: 'promotions',
                id: existingId,
                data: {
                  title: decodeText(record.title_cn),
                  subtitle: decodeText(record.sub_title_cn),
                  description: decodeText(record.description_cn),
                  content: textToLexical(record.text_cn),
                  images: {
                    cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                    thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                    facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                  },
                  meta: {
                    title: decodeText(record.seo_desc_cn),
                    description: decodeText(record.seo_desc_cn),
                    keywords: decodeText(record.seo_keyword_cn),
                  },
                },
                locale: 'zh',
              })
            }

            promotionsUpdated++
            console.log(
              `Updated existing promotion by title: ${record.title_en || record.title_th || 'Untitled'} (${record.slug || `promotion-${record.id}`})`,
            )
          } else {
            // Create new promotion record - we need at least one locale to create the record
            // Use the first available locale (Thai, Chinese, or English)
            let createLocale: 'en' | 'th' | 'zh' = 'en'
            let createData: any = null

            if (promotionData) {
              createData = promotionData
              createLocale = 'en'
            } else if (record.title_th) {
              createLocale = 'th'
              createData = {
                title: decodeText(record.title_th),
                subtitle: decodeText(record.sub_title_th),
                description: decodeText(record.description_th),
                content: textToLexical(record.text_th),
                highlight: decodeText(record.highlight || ''),
                section_highlight: decodeText(record.section_highlight || ''),
                short_alphabet: decodeText(record.short_alphabet || ''),
                start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
                end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
                show_time: decodeText(record.showTime || ''),
                status: status,
                pin_to_home: record.pin_to_home === 1,
                pin_to_section: record.pin_to_section === 1,
                sort_order: record.sort || 0,
                images: {
                  cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                  thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                  facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                },
                relationships: {
                  categories: categoryId ? [parseInt(categoryId)] : [],
                  related_content: [],
                },
                promotion_type: record.promotion_type || '',
                keywords: keywordsArray,
                meta: {
                  title: decodeText(record.seo_desc_th),
                  description: decodeText(record.seo_desc_th),
                  keywords: decodeText(record.seo_keyword_th),
                },
                system: {
                  original_id: record.id,
                  cid: record.cid || null,
                  scid: record.scid || null,
                  create_by: decodeText(record.create_by || ''),
                  modified_at: parseDate(record.modified_at),
                },
                slug: record.slug || `promotion-${record.id}`,
              }
            } else if (record.title_cn) {
              createLocale = 'zh'
              createData = {
                title: decodeText(record.title_cn),
                subtitle: decodeText(record.sub_title_cn),
                description: decodeText(record.description_cn),
                content: textToLexical(record.text_cn),
                highlight: decodeText(record.highlight || ''),
                section_highlight: decodeText(record.section_highlight || ''),
                short_alphabet: decodeText(record.short_alphabet || ''),
                start_date: parseDate(record.showDateStart || record.start_date) || '2024-01-01',
                end_date: parseDate(record.showDateEnd || record.end_date) || '2024-12-31',
                show_time: decodeText(record.showTime || ''),
                status: status,
                pin_to_home: record.pin_to_home === 1,
                pin_to_section: record.pin_to_section === 1,
                sort_order: record.sort || 0,
                images: {
                  cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                  thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                  facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                },
                relationships: {
                  categories: categoryId ? [parseInt(categoryId)] : [],
                  related_content: [],
                },
                promotion_type: record.promotion_type || '',
                keywords: keywordsArray,
                meta: {
                  title: decodeText(record.seo_desc_cn),
                  description: decodeText(record.seo_desc_cn),
                  keywords: decodeText(record.seo_keyword_cn),
                },
                system: {
                  original_id: record.id,
                  cid: record.cid || null,
                  scid: record.scid || null,
                  create_by: decodeText(record.create_by || ''),
                  modified_at: parseDate(record.modified_at),
                },
                slug: record.slug || `promotion-${record.id}`,
              }
            }

            // Only create if we have data for at least one locale
            if (createData) {
              const promotion = await payload.create({
                collection: 'promotions',
                data: createData,
                locale: createLocale,
              })

              // Update with other locales if available
              if (createLocale !== 'en' && promotionData) {
                await payload.update({
                  collection: 'promotions',
                  where: { slug: { equals: record.slug || `promotion-${record.id}` } },
                  data: promotionData,
                  locale: 'en',
                })
              }

              if (createLocale !== 'th' && record.title_th) {
                await payload.update({
                  collection: 'promotions',
                  where: { slug: { equals: record.slug || `promotion-${record.id}` } },
                  data: {
                    title: decodeText(record.title_th),
                    subtitle: decodeText(record.sub_title_th),
                    description: decodeText(record.description_th),
                    content: textToLexical(record.text_th),
                    images: {
                      cover_photo: coverPhotoId_th ? parseInt(coverPhotoId_th) : null,
                      thumbnail: imageThumbnailId_th ? parseInt(imageThumbnailId_th) : null,
                      facebook_image: facebookImageId_th ? parseInt(facebookImageId_th) : null,
                    },
                    meta: {
                      title: decodeText(record.seo_desc_th),
                      description: decodeText(record.seo_desc_th),
                      keywords: decodeText(record.seo_keyword_th),
                    },
                  },
                  locale: 'th',
                })
              }

              if (createLocale !== 'zh' && record.title_cn) {
                await payload.update({
                  collection: 'promotions',
                  where: { slug: { equals: record.slug || `promotion-${record.id}` } },
                  data: {
                    title: decodeText(record.title_cn),
                    subtitle: decodeText(record.sub_title_cn),
                    description: decodeText(record.description_cn),
                    content: textToLexical(record.text_cn),
                    images: {
                      cover_photo: coverPhotoId_cn ? parseInt(coverPhotoId_cn) : null,
                      thumbnail: imageThumbnailId_cn ? parseInt(imageThumbnailId_cn) : null,
                      facebook_image: facebookImageId_cn ? parseInt(facebookImageId_cn) : null,
                    },
                    meta: {
                      title: decodeText(record.seo_desc_cn),
                      description: decodeText(record.seo_desc_cn),
                      keywords: decodeText(record.seo_keyword_cn),
                    },
                  },
                  locale: 'zh',
                })
              }

              promotionsCreated++
              console.log(
                `Created new promotion: ${record.title_en || record.title_th || record.title_cn || 'Untitled'} (${record.slug || `promotion-${record.id}`})`,
              )
            } else {
              console.log(
                `⏭️ Skipping promotion ${record.id}: No content available in any language`,
              )
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing promotion ${record.id}:`, error)
        errorCount++
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(
      `- Promotions records: ${promotionsCreated} created, ${promotionsUpdated} updated (${promotionsCreated + promotionsUpdated} total)`,
    )
    console.log(`- Total media records processed: ${mediaMap.size}`)
    console.log(`- Total categories processed: ${categoryMap.size}`)
    console.log(`- Errors: ${errorCount} promotions`)
    console.log(`- Total records processed: ${promotionsData.length}`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    process.exit(0)
  }
}

migratePromotionsTable()
