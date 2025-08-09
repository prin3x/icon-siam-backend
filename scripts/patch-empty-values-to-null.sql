-- Script to patch empty string values to null for Events and Promotions
-- This script updates empty strings to NULL values in the specified fields

-- Update Events collection
UPDATE "events" 
SET 
  "title" = CASE WHEN "title" = '' OR "title" = ' ' THEN NULL ELSE "title" END,
  "subtitle" = CASE WHEN "subtitle" = '' OR "subtitle" = ' ' THEN NULL ELSE "subtitle" END,
  "description" = CASE WHEN "description" = '' OR "description" = ' ' THEN NULL ELSE "description" END,
  "highlight" = CASE WHEN "highlight" = '' OR "highlight" = ' ' THEN NULL ELSE "highlight" END,
  "section_highlight" = CASE WHEN "section_highlight" = '' OR "section_highlight" = ' ' THEN NULL ELSE "section_highlight" END,
  "short_alphabet" = CASE WHEN "short_alphabet" = '' OR "short_alphabet" = ' ' THEN NULL ELSE "short_alphabet" END,
  "show_time" = CASE WHEN "show_time" = '' OR "show_time" = ' ' THEN NULL ELSE "show_time" END,
  "promotion_type" = CASE WHEN "promotion_type" = '' OR "promotion_type" = ' ' THEN NULL ELSE "promotion_type" END,
  "location" = CASE 
    WHEN "location"->>'name' = '' OR "location"->>'name' = ' ' THEN 
      jsonb_set("location", '{name}', 'null'::jsonb)
    ELSE "location" 
  END,
  "meta" = CASE 
    WHEN "meta"->>'title' = '' OR "meta"->>'title' = ' ' THEN 
      jsonb_set("meta", '{title}', 'null'::jsonb)
    WHEN "meta"->>'description' = '' OR "meta"->>'description' = ' ' THEN 
      jsonb_set("meta", '{description}', 'null'::jsonb)
    WHEN "meta"->>'keywords' = '' OR "meta"->>'keywords' = ' ' THEN 
      jsonb_set("meta", '{keywords}', 'null'::jsonb)
    ELSE "meta" 
  END
WHERE 
  "title" = '' OR "title" = ' ' OR
  "subtitle" = '' OR "subtitle" = ' ' OR
  "description" = '' OR "description" = ' ' OR
  "highlight" = '' OR "highlight" = ' ' OR
  "section_highlight" = '' OR "section_highlight" = ' ' OR
  "short_alphabet" = '' OR "short_alphabet" = ' ' OR
  "show_time" = '' OR "show_time" = ' ' OR
  "promotion_type" = '' OR "promotion_type" = ' ' OR
  ("location"->>'name') = '' OR ("location"->>'name') = ' ' OR
  ("meta"->>'title') = '' OR ("meta"->>'title') = ' ' OR
  ("meta"->>'description') = '' OR ("meta"->>'description') = ' ' OR
  ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ';

-- Update Promotions collection
UPDATE "promotions" 
SET 
  "title" = CASE WHEN "title" = '' OR "title" = ' ' THEN NULL ELSE "title" END,
  "subtitle" = CASE WHEN "subtitle" = '' OR "subtitle" = ' ' THEN NULL ELSE "subtitle" END,
  "description" = CASE WHEN "description" = '' OR "description" = ' ' THEN NULL ELSE "description" END,
  "highlight" = CASE WHEN "highlight" = '' OR "highlight" = ' ' THEN NULL ELSE "highlight" END,
  "section_highlight" = CASE WHEN "section_highlight" = '' OR "section_highlight" = ' ' THEN NULL ELSE "section_highlight" END,
  "short_alphabet" = CASE WHEN "short_alphabet" = '' OR "short_alphabet" = ' ' THEN NULL ELSE "short_alphabet" END,
  "show_time" = CASE WHEN "show_time" = '' OR "show_time" = ' ' THEN NULL ELSE "show_time" END,
  "promotion_type" = CASE WHEN "promotion_type" = '' OR "promotion_type" = ' ' THEN NULL ELSE "promotion_type" END,
  "meta" = CASE 
    WHEN "meta"->>'title' = '' OR "meta"->>'title' = ' ' THEN 
      jsonb_set("meta", '{title}', 'null'::jsonb)
    WHEN "meta"->>'description' = '' OR "meta"->>'description' = ' ' THEN 
      jsonb_set("meta", '{description}', 'null'::jsonb)
    WHEN "meta"->>'keywords' = '' OR "meta"->>'keywords' = ' ' THEN 
      jsonb_set("meta", '{keywords}', 'null'::jsonb)
    ELSE "meta" 
  END
WHERE 
  "title" = '' OR "title" = ' ' OR
  "subtitle" = '' OR "subtitle" = ' ' OR
  "description" = '' OR "description" = ' ' OR
  "highlight" = '' OR "highlight" = ' ' OR
  "section_highlight" = '' OR "section_highlight" = ' ' OR
  "short_alphabet" = '' OR "short_alphabet" = ' ' OR
  "show_time" = '' OR "show_time" = ' ' OR
  "promotion_type" = '' OR "promotion_type" = ' ' OR
  ("meta"->>'title') = '' OR ("meta"->>'title') = ' ' OR
  ("meta"->>'description') = '' OR ("meta"->>'description') = ' ' OR
  ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ';

-- Show summary of changes
SELECT 
  'Events' as collection,
  COUNT(*) as total_records,
  COUNT(CASE WHEN "title" IS NULL THEN 1 END) as null_titles,
  COUNT(CASE WHEN "subtitle" IS NULL THEN 1 END) as null_subtitles,
  COUNT(CASE WHEN "description" IS NULL THEN 1 END) as null_descriptions,
  COUNT(CASE WHEN "highlight" IS NULL THEN 1 END) as null_highlights,
  COUNT(CASE WHEN "section_highlight" IS NULL THEN 1 END) as null_section_highlights,
  COUNT(CASE WHEN "short_alphabet" IS NULL THEN 1 END) as null_short_alphabets,
  COUNT(CASE WHEN "show_time" IS NULL THEN 1 END) as null_show_times,
  COUNT(CASE WHEN "promotion_type" IS NULL THEN 1 END) as null_promotion_types
FROM "events"
UNION ALL
SELECT 
  'Promotions' as collection,
  COUNT(*) as total_records,
  COUNT(CASE WHEN "title" IS NULL THEN 1 END) as null_titles,
  COUNT(CASE WHEN "subtitle" IS NULL THEN 1 END) as null_subtitles,
  COUNT(CASE WHEN "description" IS NULL THEN 1 END) as null_descriptions,
  COUNT(CASE WHEN "highlight" IS NULL THEN 1 END) as null_highlights,
  COUNT(CASE WHEN "section_highlight" IS NULL THEN 1 END) as null_section_highlights,
  COUNT(CASE WHEN "short_alphabet" IS NULL THEN 1 END) as null_short_alphabets,
  COUNT(CASE WHEN "show_time" IS NULL THEN 1 END) as null_show_times,
  COUNT(CASE WHEN "promotion_type" IS NULL THEN 1 END) as null_promotion_types
FROM "promotions"; 