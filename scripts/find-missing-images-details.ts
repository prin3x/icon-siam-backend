import { Pool } from 'pg'

async function findMissingImagesDetails() {
  // Create database connection
  const pool = new Pool({
    host: process.env.DATABASE_URL,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DB_PASS,
    ssl: process.env.DATABASE_SSL_MODE === 'true' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    console.log('🔍 Finding specific records with missing images...\n')

    // Find events with missing cover or thumbnail images
    console.log('📊 EVENTS WITH MISSING COVER OR THUMBNAIL:')
    const eventsMissing = await pool.query(`
      SELECT 
        _locale,
        _parent_id,
        title,
        images_cover_photo_id,
        images_thumbnail_id
      FROM events_locales 
      WHERE images_cover_photo_id IS NULL 
         OR images_thumbnail_id IS NULL
      ORDER BY _locale, _parent_id
    `)

    if (eventsMissing.rows.length === 0) {
      console.log('  ✅ No events with missing images found!')
    } else {
      console.log(`  Found ${eventsMissing.rows.length} event records with missing images:`)
      eventsMissing.rows.forEach((row, index) => {
        const missingTypes = []
        if (row.images_cover_photo_id === null) missingTypes.push('cover')
        if (row.images_thumbnail_id === null) missingTypes.push('thumbnail')

        console.log(
          `    ${index + 1}. ${row._locale} - ID: ${row._parent_id} - "${row.title}" - Missing: ${missingTypes.join(', ')}`,
        )
      })
    }

    // Find promotions with missing cover or thumbnail images
    console.log('\n📊 PROMOTIONS WITH MISSING COVER OR THUMBNAIL:')
    const promotionsMissing = await pool.query(`
      SELECT 
        _locale,
        _parent_id,
        title,
        images_cover_photo_id,
        images_thumbnail_id
      FROM promotions_locales 
      WHERE images_cover_photo_id IS NULL 
         OR images_thumbnail_id IS NULL
      ORDER BY _locale, _parent_id
    `)

    if (promotionsMissing.rows.length === 0) {
      console.log('  ✅ No promotions with missing images found!')
    } else {
      console.log(`  Found ${promotionsMissing.rows.length} promotion records with missing images:`)
      promotionsMissing.rows.forEach((row, index) => {
        const missingTypes = []
        if (row.images_cover_photo_id === null) missingTypes.push('cover')
        if (row.images_thumbnail_id === null) missingTypes.push('thumbnail')

        console.log(
          `    ${index + 1}. ${row._locale} - ID: ${row._parent_id} - "${row.title}" - Missing: ${missingTypes.join(', ')}`,
        )
      })
    }

    // Check if any records have no cover or thumbnail images across all locales
    console.log('\n🔍 CHECKING RECORDS WITH NO COVER OR THUMBNAIL ACROSS ALL LOCALES:')

    const eventsNoImages = await pool.query(`
      SELECT 
        e._parent_id,
        e.title as th_title,
        en.title as en_title,
        zh.title as zh_title
      FROM events_locales e
      LEFT JOIN events_locales en ON e._parent_id = en._parent_id AND en._locale = 'en'
      LEFT JOIN events_locales zh ON e._parent_id = zh._parent_id AND zh._locale = 'zh'
      WHERE e._locale = 'th'
      AND e.images_cover_photo_id IS NULL 
      AND e.images_thumbnail_id IS NULL
      AND (en.images_cover_photo_id IS NULL OR en.images_cover_photo_id IS NULL)
      AND (en.images_thumbnail_id IS NULL OR en.images_thumbnail_id IS NULL)
      AND (zh.images_cover_photo_id IS NULL OR zh.images_cover_photo_id IS NULL)
      AND (zh.images_thumbnail_id IS NULL OR zh.images_thumbnail_id IS NULL)
      ORDER BY e._parent_id
    `)

    if (eventsNoImages.rows.length > 0) {
      console.log(`  Events with no cover or thumbnail at all: ${eventsNoImages.rows.length}`)
      eventsNoImages.rows.forEach((row, index) => {
        console.log(
          `    ${index + 1}. ID: ${row._parent_id} - TH: "${row.th_title}" - EN: "${row.en_title}" - ZH: "${row.zh_title}"`,
        )
      })
    } else {
      console.log('  ✅ All events have at least some cover or thumbnail images across locales')
    }

    const promotionsNoImages = await pool.query(`
      SELECT 
        p._parent_id,
        p.title as th_title,
        en.title as en_title,
        zh.title as zh_title
      FROM promotions_locales p
      LEFT JOIN promotions_locales en ON p._parent_id = en._parent_id AND en._locale = 'en'
      LEFT JOIN promotions_locales zh ON p._parent_id = zh._parent_id AND zh._locale = 'zh'
      WHERE p._locale = 'th'
      AND p.images_cover_photo_id IS NULL 
      AND p.images_thumbnail_id IS NULL
      AND (en.images_cover_photo_id IS NULL OR en.images_cover_photo_id IS NULL)
      AND (en.images_thumbnail_id IS NULL OR en.images_thumbnail_id IS NULL)
      AND (zh.images_cover_photo_id IS NULL OR zh.images_cover_photo_id IS NULL)
      AND (zh.images_thumbnail_id IS NULL OR zh.images_thumbnail_id IS NULL)
      ORDER BY p._parent_id
    `)

    if (promotionsNoImages.rows.length > 0) {
      console.log(
        `  Promotions with no cover or thumbnail at all: ${promotionsNoImages.rows.length}`,
      )
      promotionsNoImages.rows.forEach((row, index) => {
        console.log(
          `    ${index + 1}. ID: ${row._parent_id} - TH: "${row.th_title}" - EN: "${row.en_title}" - ZH: "${row.zh_title}"`,
        )
      })
    } else {
      console.log('  ✅ All promotions have at least some cover or thumbnail images across locales')
    }

    console.log('\n✅ Analysis complete!')
  } catch (error) {
    console.error('❌ Error finding missing images details:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run the script
findMissingImagesDetails().catch(console.error)
