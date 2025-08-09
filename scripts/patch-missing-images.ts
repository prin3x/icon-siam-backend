import { Pool } from 'pg'

async function patchMissingImages() {
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
    console.log('🔍 Analyzing missing images in events and promotions...\n')

    // Analyze events before patching
    console.log('📊 EVENTS ANALYSIS:')
    const eventsAnalysis = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
      FROM events_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    eventsAnalysis.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.missing_cover} missing cover, ${row.missing_thumbnail} missing thumbnail, ${row.missing_facebook} missing facebook`,
      )
    })

    // Analyze promotions before patching
    console.log('\n📊 PROMOTIONS ANALYSIS:')
    const promotionsAnalysis = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
      FROM promotions_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    promotionsAnalysis.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.missing_cover} missing cover, ${row.missing_thumbnail} missing thumbnail, ${row.missing_facebook} missing facebook`,
      )
    })

    console.log('\n🔄 Patching missing images...')

    // Patch events: Copy images from any available locale to missing locales
    // Priority: th -> en -> zh (copy from first available locale that has images)
    const eventsPatchResult = await pool.query(`
      UPDATE events_locales 
      SET 
        images_cover_photo_id = COALESCE(
          (SELECT th.images_cover_photo_id 
           FROM events_locales th 
           WHERE th._parent_id = events_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_cover_photo_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_cover_photo_id 
           FROM events_locales en 
           WHERE en._parent_id = events_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_cover_photo_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_cover_photo_id 
           FROM events_locales zh 
           WHERE zh._parent_id = events_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_cover_photo_id IS NOT NULL
           LIMIT 1)
        ),
        images_thumbnail_id = COALESCE(
          (SELECT th.images_thumbnail_id 
           FROM events_locales th 
           WHERE th._parent_id = events_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_thumbnail_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_thumbnail_id 
           FROM events_locales en 
           WHERE en._parent_id = events_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_thumbnail_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_thumbnail_id 
           FROM events_locales zh 
           WHERE zh._parent_id = events_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_thumbnail_id IS NOT NULL
           LIMIT 1)
        ),
        images_facebook_image_id = COALESCE(
          (SELECT th.images_facebook_image_id 
           FROM events_locales th 
           WHERE th._parent_id = events_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_facebook_image_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_facebook_image_id 
           FROM events_locales en 
           WHERE en._parent_id = events_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_facebook_image_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_facebook_image_id 
           FROM events_locales zh 
           WHERE zh._parent_id = events_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_facebook_image_id IS NOT NULL
           LIMIT 1)
        )
      WHERE _locale IN ('th', 'en', 'zh')
      AND (
        images_cover_photo_id IS NULL OR 
        images_thumbnail_id IS NULL OR 
        images_facebook_image_id IS NULL
      )
      AND EXISTS (
        SELECT 1 FROM events_locales other 
        WHERE other._parent_id = events_locales._parent_id 
        AND other._locale != events_locales._locale
        AND (
          other.images_cover_photo_id IS NOT NULL OR 
          other.images_thumbnail_id IS NOT NULL OR 
          other.images_facebook_image_id IS NOT NULL
        )
      )
    `)

    console.log(`✅ Updated ${eventsPatchResult.rowCount} event locale records`)

    // Patch promotions: Copy images from any available locale to missing locales
    // Priority: th -> en -> zh (copy from first available locale that has images)
    const promotionsPatchResult = await pool.query(`
      UPDATE promotions_locales 
      SET 
        images_cover_photo_id = COALESCE(
          (SELECT th.images_cover_photo_id 
           FROM promotions_locales th 
           WHERE th._parent_id = promotions_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_cover_photo_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_cover_photo_id 
           FROM promotions_locales en 
           WHERE en._parent_id = promotions_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_cover_photo_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_cover_photo_id 
           FROM promotions_locales zh 
           WHERE zh._parent_id = promotions_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_cover_photo_id IS NOT NULL
           LIMIT 1)
        ),
        images_thumbnail_id = COALESCE(
          (SELECT th.images_thumbnail_id 
           FROM promotions_locales th 
           WHERE th._parent_id = promotions_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_thumbnail_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_thumbnail_id 
           FROM promotions_locales en 
           WHERE en._parent_id = promotions_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_thumbnail_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_thumbnail_id 
           FROM promotions_locales zh 
           WHERE zh._parent_id = promotions_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_thumbnail_id IS NOT NULL
           LIMIT 1)
        ),
        images_facebook_image_id = COALESCE(
          (SELECT th.images_facebook_image_id 
           FROM promotions_locales th 
           WHERE th._parent_id = promotions_locales._parent_id 
           AND th._locale = 'th' 
           AND th.images_facebook_image_id IS NOT NULL
           LIMIT 1),
          (SELECT en.images_facebook_image_id 
           FROM promotions_locales en 
           WHERE en._parent_id = promotions_locales._parent_id 
           AND en._locale = 'en' 
           AND en.images_facebook_image_id IS NOT NULL
           LIMIT 1),
          (SELECT zh.images_facebook_image_id 
           FROM promotions_locales zh 
           WHERE zh._parent_id = promotions_locales._parent_id 
           AND zh._locale = 'zh' 
           AND zh.images_facebook_image_id IS NOT NULL
           LIMIT 1)
        )
      WHERE _locale IN ('th', 'en', 'zh')
      AND (
        images_cover_photo_id IS NULL OR 
        images_thumbnail_id IS NULL OR 
        images_facebook_image_id IS NULL
      )
      AND EXISTS (
        SELECT 1 FROM promotions_locales other 
        WHERE other._parent_id = promotions_locales._parent_id 
        AND other._locale != promotions_locales._locale
        AND (
          other.images_cover_photo_id IS NOT NULL OR 
          other.images_thumbnail_id IS NOT NULL OR 
          other.images_facebook_image_id IS NOT NULL
        )
      )
    `)

    console.log(`✅ Updated ${promotionsPatchResult.rowCount} promotion locale records`)

    // Show results after patching
    console.log('\n📊 RESULTS AFTER PATCHING:')

    const eventsAfter = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
      FROM events_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    console.log('📊 EVENTS AFTER PATCHING:')
    eventsAfter.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.missing_cover} missing cover, ${row.missing_thumbnail} missing thumbnail, ${row.missing_facebook} missing facebook`,
      )
    })

    const promotionsAfter = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
      FROM promotions_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    console.log('\n📊 PROMOTIONS AFTER PATCHING:')
    promotionsAfter.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.missing_cover} missing cover, ${row.missing_thumbnail} missing thumbnail, ${row.missing_facebook} missing facebook`,
      )
    })

    console.log('\n✅ Patching complete!')
  } catch (error) {
    console.error('❌ Error patching missing images:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run the script
patchMissingImages().catch(console.error)
