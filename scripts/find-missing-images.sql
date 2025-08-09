-- Script to find specific records with missing images after patching
-- This will help identify which records need manual attention

-- Find events with missing cover or thumbnail images
SELECT 'EVENTS WITH MISSING COVER OR THUMBNAIL' as section;
SELECT 
    locale,
    parent_id,
    title,
    CASE WHEN images_cover_photo_id IS NULL THEN 'MISSING' ELSE 'OK' END as cover_status,
    CASE WHEN images_thumbnail_id IS NULL THEN 'MISSING' ELSE 'OK' END as thumbnail_status
FROM events_locales 
WHERE images_cover_photo_id IS NULL 
   OR images_thumbnail_id IS NULL
ORDER BY locale, parent_id;

-- Find promotions with missing cover or thumbnail images
SELECT 'PROMOTIONS WITH MISSING COVER OR THUMBNAIL' as section;
SELECT 
    locale,
    parent_id,
    title,
    CASE WHEN images_cover_photo_id IS NULL THEN 'MISSING' ELSE 'OK' END as cover_status,
    CASE WHEN images_thumbnail_id IS NULL THEN 'MISSING' ELSE 'OK' END as thumbnail_status
FROM promotions_locales 
WHERE images_cover_photo_id IS NULL 
   OR images_thumbnail_id IS NULL
ORDER BY locale, parent_id;

-- Check for records that have no cover or thumbnail images across all locales
SELECT 'EVENTS WITH NO COVER OR THUMBNAIL ACROSS ALL LOCALES' as section;
SELECT 
    e.parent_id,
    e.title as th_title,
    en.title as en_title,
    zh.title as zh_title
FROM events_locales e
LEFT JOIN events_locales en ON e.parent_id = en.parent_id AND en.locale = 'en'
LEFT JOIN events_locales zh ON e.parent_id = zh.parent_id AND zh.locale = 'zh'
WHERE e.locale = 'th'
AND e.images_cover_photo_id IS NULL 
AND e.images_thumbnail_id IS NULL
AND (en.images_cover_photo_id IS NULL OR en.images_cover_photo_id IS NULL)
AND (en.images_thumbnail_id IS NULL OR en.images_thumbnail_id IS NULL)
AND (zh.images_cover_photo_id IS NULL OR zh.images_cover_photo_id IS NULL)
AND (zh.images_thumbnail_id IS NULL OR zh.images_thumbnail_id IS NULL)
ORDER BY e.parent_id;

SELECT 'PROMOTIONS WITH NO COVER OR THUMBNAIL ACROSS ALL LOCALES' as section;
SELECT 
    p.parent_id,
    p.title as th_title,
    en.title as en_title,
    zh.title as zh_title
FROM promotions_locales p
LEFT JOIN promotions_locales en ON p.parent_id = en.parent_id AND en.locale = 'en'
LEFT JOIN promotions_locales zh ON p.parent_id = zh.parent_id AND zh.locale = 'zh'
WHERE p.locale = 'th'
AND p.images_cover_photo_id IS NULL 
AND p.images_thumbnail_id IS NULL
AND (en.images_cover_photo_id IS NULL OR en.images_cover_photo_id IS NULL)
AND (en.images_thumbnail_id IS NULL OR en.images_thumbnail_id IS NULL)
AND (zh.images_cover_photo_id IS NULL OR zh.images_cover_photo_id IS NULL)
AND (zh.images_thumbnail_id IS NULL OR zh.images_thumbnail_id IS NULL)
ORDER BY p.parent_id;

-- Summary counts for cover and thumbnail only
SELECT 'SUMMARY - EVENTS MISSING COVER OR THUMBNAIL' as section;
SELECT 
    locale,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail
FROM events_locales 
GROUP BY locale
ORDER BY locale;

SELECT 'SUMMARY - PROMOTIONS MISSING COVER OR THUMBNAIL' as section;
SELECT 
    locale,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail
FROM promotions_locales 
GROUP BY locale
ORDER BY locale; 