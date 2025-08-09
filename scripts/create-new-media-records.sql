-- Create new media records for events and promotions images
-- This script creates new media records with new IDs but keeps the same image URLs

-- Step 1: Create a temporary table to store the new media mappings
CREATE TEMP TABLE media_mapping (
    old_id INTEGER,
    new_id INTEGER,
    filename TEXT,
    mime_type TEXT,
    filesize INTEGER,
    width INTEGER,
    height INTEGER,
    url TEXT,
    alt TEXT
);

-- Step 2: Get all unique media records referenced by events and promotions
INSERT INTO media_mapping (old_id, filename, mime_type, filesize, width, height, url, alt)
SELECT DISTINCT 
    m.id,
    m.filename,
    m.mime_type,
    m.filesize,
    m.width,
    m.height,
    m.url,
    m.alt
FROM media m
JOIN events_locales el ON m.id IN (
    el.images_cover_photo_id, 
    el.images_facebook_image_id, 
    el.images_thumbnail_id
)
UNION
SELECT DISTINCT 
    m.id,
    m.filename,
    m.mime_type,
    m.filesize,
    m.width,
    m.height,
    m.url,
    m.alt
FROM media m
JOIN promotions_locales pl ON m.id IN (
    pl.images_cover_photo_id, 
    pl.images_facebook_image_id, 
    pl.images_thumbnail_id
);

-- Step 3: Generate new IDs for the media records
UPDATE media_mapping 
SET new_id = nextval('media_id_seq');

-- Step 4: Insert new media records
INSERT INTO media (id, filename, mime_type, filesize, width, height, url, alt, created_at, updated_at)
SELECT 
    new_id,
    filename,
    mime_type,
    filesize,
    width,
    height,
    url,
    alt,
    NOW(),
    NOW()
FROM media_mapping;

-- Step 5: Update events_locales to use new media IDs
UPDATE events_locales 
SET images_cover_photo_id = mm.new_id
FROM media_mapping mm 
WHERE events_locales.images_cover_photo_id = mm.old_id;

UPDATE events_locales 
SET images_facebook_image_id = mm.new_id
FROM media_mapping mm 
WHERE events_locales.images_facebook_image_id = mm.old_id;

UPDATE events_locales 
SET images_thumbnail_id = mm.new_id
FROM media_mapping mm 
WHERE events_locales.images_thumbnail_id = mm.old_id;

-- Step 6: Update promotions_locales to use new media IDs
UPDATE promotions_locales 
SET images_cover_photo_id = mm.new_id
FROM media_mapping mm 
WHERE promotions_locales.images_cover_photo_id = mm.old_id;

UPDATE promotions_locales 
SET images_facebook_image_id = mm.new_id
FROM media_mapping mm 
WHERE promotions_locales.images_facebook_image_id = mm.old_id;

UPDATE promotions_locales 
SET images_thumbnail_id = mm.new_id
FROM media_mapping mm 
WHERE promotions_locales.images_thumbnail_id = mm.old_id;

-- Step 7: Show summary of changes
SELECT 
    'Events and Promotions Media Migration Summary' as summary,
    COUNT(*) as total_new_media_records,
    COUNT(DISTINCT old_id) as unique_original_media,
    COUNT(DISTINCT new_id) as unique_new_media
FROM media_mapping;

-- Step 8: Show sample of new media records
SELECT 
    'Sample New Media Records' as info,
    new_id,
    filename,
    mime_type,
    filesize
FROM media_mapping 
LIMIT 10; 