import { Pool } from 'pg'

async function preservePromotionImages() {
  // Create database connection
  const pool = new Pool({
    host: process.env.DATABASE_URL,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DB_PASS,
    // ssl: process.env.DATABASE_SSL_MODE === 'true' ? { rejectUnauthorized: false } : undefined,
  })

  try {
    console.log('🔍 Preserving existing promotion images...\n')

    // First, let's see what we have in the main promotions table
    console.log('📊 CURRENT PROMOTIONS TABLE:')
    const currentPromotions = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NOT NULL THEN 1 END) as has_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NOT NULL THEN 1 END) as has_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NOT NULL THEN 1 END) as has_facebook
      FROM promotions
    `)

    const stats = currentPromotions.rows[0]
    console.log(`  Total promotions: ${stats.total_records}`)
    console.log(`  With cover photos: ${stats.has_cover}`)
    console.log(`  With thumbnails: ${stats.has_thumbnail}`)
    console.log(`  With facebook images: ${stats.has_facebook}`)

    // Check what we have in promotions_locales
    console.log('\n📊 CURRENT PROMOTIONS_LOCALES TABLE:')
    const currentLocales = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NOT NULL THEN 1 END) as has_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NOT NULL THEN 1 END) as has_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NOT NULL THEN 1 END) as has_facebook
      FROM promotions_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    currentLocales.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.has_cover} cover, ${row.has_thumbnail} thumbnail, ${row.has_facebook} facebook`,
      )
    })

    console.log('\n🔄 Preserving images from main promotions table to promotions_locales...')

    // Update promotions_locales with images from main promotions table
    // We'll copy to all locales (th, en, zh) that don't already have images
    const updateResult = await pool.query(`
      UPDATE promotions_locales 
      SET 
        images_cover_photo_id = (
          SELECT p.images_cover_photo_id 
          FROM promotions p 
          WHERE p.id = promotions_locales._parent_id 
          AND p.images_cover_photo_id IS NOT NULL
        ),
        images_thumbnail_id = (
          SELECT p.images_thumbnail_id 
          FROM promotions p 
          WHERE p.id = promotions_locales._parent_id 
          AND p.images_thumbnail_id IS NOT NULL
        ),
        images_facebook_image_id = (
          SELECT p.images_facebook_image_id 
          FROM promotions p 
          WHERE p.id = promotions_locales._parent_id 
          AND p.images_facebook_image_id IS NOT NULL
        )
      WHERE (
        images_cover_photo_id IS NULL OR 
        images_thumbnail_id IS NULL OR 
        images_facebook_image_id IS NULL
      )
      AND EXISTS (
        SELECT 1 FROM promotions p 
        WHERE p.id = promotions_locales._parent_id
        AND (
          p.images_cover_photo_id IS NOT NULL OR 
          p.images_thumbnail_id IS NOT NULL OR 
          p.images_facebook_image_id IS NOT NULL
        )
      )
    `)

    console.log(`✅ Updated ${updateResult.rowCount} promotion locale records`)

    // Show results after preservation
    console.log('\n📊 RESULTS AFTER PRESERVATION:')

    const afterLocales = await pool.query(`
      SELECT 
        _locale,
        COUNT(*) as total_records,
        COUNT(CASE WHEN images_cover_photo_id IS NOT NULL THEN 1 END) as has_cover,
        COUNT(CASE WHEN images_thumbnail_id IS NOT NULL THEN 1 END) as has_thumbnail,
        COUNT(CASE WHEN images_facebook_image_id IS NOT NULL THEN 1 END) as has_facebook
      FROM promotions_locales 
      GROUP BY _locale
      ORDER BY _locale
    `)

    console.log('📊 PROMOTIONS_LOCALES AFTER PRESERVATION:')
    afterLocales.rows.forEach((row) => {
      console.log(
        `  ${row._locale}: ${row.total_records} records, ${row.has_cover} cover, ${row.has_thumbnail} thumbnail, ${row.has_facebook} facebook`,
      )
    })

    // Show summary of what was preserved
    const summary = await pool.query(`
      SELECT 
        COUNT(CASE WHEN images_cover_photo_id IS NOT NULL THEN 1 END) as total_cover_preserved,
        COUNT(CASE WHEN images_thumbnail_id IS NOT NULL THEN 1 END) as total_thumbnail_preserved,
        COUNT(CASE WHEN images_facebook_image_id IS NOT NULL THEN 1 END) as total_facebook_preserved
      FROM promotions_locales
    `)

    const summaryStats = summary.rows[0]
    console.log('\n📊 PRESERVATION SUMMARY:')
    console.log(`  Total cover photos preserved: ${summaryStats.total_cover_preserved}`)
    console.log(`  Total thumbnails preserved: ${summaryStats.total_thumbnail_preserved}`)
    console.log(`  Total facebook images preserved: ${summaryStats.total_facebook_preserved}`)

    console.log('\n✅ Image preservation complete!')
    console.log(
      '💡 You can now safely run your migration that drops the old image columns from the promotions table.',
    )
  } catch (error) {
    console.error('❌ Error preserving promotion images:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

// Run the script
preservePromotionImages().catch(console.error)
