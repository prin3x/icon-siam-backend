-- Script to patch missing images in events and promotions
-- This script finds locales with content but no images and copies images from sibling locales

-- First, let's see what we're working with
SELECT 'EVENTS ANALYSIS' as section;
SELECT 
    locale,
    COUNT(*) as total_records,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
    COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
FROM events_locales 
GROUP BY locale;

SELECT 'PROMOTIONS ANALYSIS' as section;
SELECT 
    locale,
    COUNT(*) as total_records,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
    COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
FROM promotions_locales 
GROUP BY locale;

-- PATCH EVENTS: Copy images from Thai locale to English and Chinese where missing
UPDATE events_locales 
SET 
    images_cover_photo_id = (
        SELECT th.images_cover_photo_id 
        FROM events_locales th 
        WHERE th.parent_id = events_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_cover_photo_id IS NOT NULL
        LIMIT 1
    ),
    images_thumbnail_id = (
        SELECT th.images_thumbnail_id 
        FROM events_locales th 
        WHERE th.parent_id = events_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_thumbnail_id IS NOT NULL
        LIMIT 1
    ),
    images_facebook_image_id = (
        SELECT th.images_facebook_image_id 
        FROM events_locales th 
        WHERE th.parent_id = events_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_facebook_image_id IS NOT NULL
        LIMIT 1
    )
WHERE locale IN ('en', 'zh')
AND (
    images_cover_photo_id IS NULL OR 
    images_thumbnail_id IS NULL OR 
    images_facebook_image_id IS NULL
)
AND EXISTS (
    SELECT 1 FROM events_locales th 
    WHERE th.parent_id = events_locales.parent_id 
    AND th.locale = 'th'
);

-- PATCH PROMOTIONS: Copy images from Thai locale to English and Chinese where missing
UPDATE promotions_locales 
SET 
    images_cover_photo_id = (
        SELECT th.images_cover_photo_id 
        FROM promotions_locales th 
        WHERE th.parent_id = promotions_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_cover_photo_id IS NOT NULL
        LIMIT 1
    ),
    images_thumbnail_id = (
        SELECT th.images_thumbnail_id 
        FROM promotions_locales th 
        WHERE th.parent_id = promotions_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_thumbnail_id IS NOT NULL
        LIMIT 1
    ),
    images_facebook_image_id = (
        SELECT th.images_facebook_image_id 
        FROM promotions_locales th 
        WHERE th.parent_id = promotions_locales.parent_id 
        AND th.locale = 'th' 
        AND th.images_facebook_image_id IS NOT NULL
        LIMIT 1
    )
WHERE locale IN ('en', 'zh')
AND (
    images_cover_photo_id IS NULL OR 
    images_thumbnail_id IS NULL OR 
    images_facebook_image_id IS NULL
)
AND EXISTS (
    SELECT 1 FROM promotions_locales th 
    WHERE th.parent_id = promotions_locales.parent_id 
    AND th.locale = 'th'
);

-- Show results after patching
SELECT 'EVENTS AFTER PATCHING' as section;
SELECT 
    locale,
    COUNT(*) as total_records,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
    COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
FROM events_locales 
GROUP BY locale;

SELECT 'PROMOTIONS AFTER PATCHING' as section;
SELECT 
    locale,
    COUNT(*) as total_records,
    COUNT(CASE WHEN images_cover_photo_id IS NULL THEN 1 END) as missing_cover,
    COUNT(CASE WHEN images_thumbnail_id IS NULL THEN 1 END) as missing_thumbnail,
    COUNT(CASE WHEN images_facebook_image_id IS NULL THEN 1 END) as missing_facebook
FROM promotions_locales 
GROUP BY locale; 