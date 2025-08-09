-- Media UPSERT dump
-- This will update existing records and insert new ones
-- Run this on a database that already has the media table structure

-- UPSERT all media records
-- This will update existing records and insert new ones
INSERT INTO public.media (id, filename, alt, caption, collection, created_at, updated_at, url, thumbnail_url, filename_original, mime_type, filesize, width, height, focal_x, focal_y)
ON CONFLICT (id) DO UPDATE SET
    filename = EXCLUDED.filename,
    alt = EXCLUDED.alt,
    caption = EXCLUDED.caption,
    collection = EXCLUDED.collection,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at,
    url = EXCLUDED.url,
    thumbnail_url = EXCLUDED.thumbnail_url,
    filename_original = EXCLUDED.filename_original,
    mime_type = EXCLUDED.mime_type,
    filesize = EXCLUDED.filesize,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    focal_x = EXCLUDED.focal_x,
    focal_y = EXCLUDED.focal_y;

-- Reset sequence to max ID
SELECT setval('public.media_id_seq', (SELECT MAX(id) FROM public.media), true);
