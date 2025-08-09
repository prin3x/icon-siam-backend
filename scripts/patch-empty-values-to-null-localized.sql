-- Script to patch empty string values to null for Events and Promotions
-- This script handles localized fields properly (PayloadCMS stores them as JSON objects)

-- Update Events collection (including localized fields)
UPDATE "events" 
SET 
  -- Handle localized fields (stored as JSON objects)
  "title" = CASE 
    WHEN "title" = '' OR "title" = ' ' THEN NULL 
    WHEN jsonb_typeof("title") = 'object' THEN
      CASE 
        WHEN ("title"->>'en') = '' OR ("title"->>'en') = ' ' THEN 
          jsonb_set("title", '{en}', 'null'::jsonb)
        WHEN ("title"->>'th') = '' OR ("title"->>'th') = ' ' THEN 
          jsonb_set("title", '{th}', 'null'::jsonb)
        ELSE "title"
      END
    ELSE "title" 
  END,
  
  "subtitle" = CASE 
    WHEN "subtitle" = '' OR "subtitle" = ' ' THEN NULL 
    WHEN jsonb_typeof("subtitle") = 'object' THEN
      CASE 
        WHEN ("subtitle"->>'en') = '' OR ("subtitle"->>'en') = ' ' THEN 
          jsonb_set("subtitle", '{en}', 'null'::jsonb)
        WHEN ("subtitle"->>'th') = '' OR ("subtitle"->>'th') = ' ' THEN 
          jsonb_set("subtitle", '{th}', 'null'::jsonb)
        ELSE "subtitle"
      END
    ELSE "subtitle" 
  END,
  
  "description" = CASE 
    WHEN "description" = '' OR "description" = ' ' THEN NULL 
    WHEN jsonb_typeof("description") = 'object' THEN
      CASE 
        WHEN ("description"->>'en') = '' OR ("description"->>'en') = ' ' THEN 
          jsonb_set("description", '{en}', 'null'::jsonb)
        WHEN ("description"->>'th') = '' OR ("description"->>'th') = ' ' THEN 
          jsonb_set("description", '{th}', 'null'::jsonb)
        ELSE "description"
      END
    ELSE "description" 
  END,
  
  -- Non-localized fields
  "highlight" = CASE WHEN "highlight" = '' OR "highlight" = ' ' THEN NULL ELSE "highlight" END,
  "section_highlight" = CASE WHEN "section_highlight" = '' OR "section_highlight" = ' ' THEN NULL ELSE "section_highlight" END,
  "short_alphabet" = CASE WHEN "short_alphabet" = '' OR "short_alphabet" = ' ' THEN NULL ELSE "short_alphabet" END,
  "show_time" = CASE WHEN "show_time" = '' OR "show_time" = ' ' THEN NULL ELSE "show_time" END,
  "promotion_type" = CASE WHEN "promotion_type" = '' OR "promotion_type" = ' ' THEN NULL ELSE "promotion_type" END,
  
  -- Nested fields
  "location" = CASE 
    WHEN ("location"->>'name') = '' OR ("location"->>'name') = ' ' THEN 
      jsonb_set("location", '{name}', 'null'::jsonb)
    ELSE "location" 
  END,
  
  "meta" = CASE 
    WHEN ("meta"->>'title') = '' OR ("meta"->>'title') = ' ' THEN 
      jsonb_set("meta", '{title}', 'null'::jsonb)
    WHEN ("meta"->>'description') = '' OR ("meta"->>'description') = ' ' THEN 
      jsonb_set("meta", '{description}', 'null'::jsonb)
    WHEN ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ' THEN 
      jsonb_set("meta", '{keywords}', 'null'::jsonb)
    ELSE "meta" 
  END
WHERE 
  -- Check for empty values in any of the fields
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
  ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ' OR
  -- Check localized fields
  (jsonb_typeof("title") = 'object' AND (("title"->>'en') = '' OR ("title"->>'en') = ' ' OR ("title"->>'th') = '' OR ("title"->>'th') = ' ')) OR
  (jsonb_typeof("subtitle") = 'object' AND (("subtitle"->>'en') = '' OR ("subtitle"->>'en') = ' ' OR ("subtitle"->>'th') = '' OR ("subtitle"->>'th') = ' ')) OR
  (jsonb_typeof("description") = 'object' AND (("description"->>'en') = '' OR ("description"->>'en') = ' ' OR ("description"->>'th') = '' OR ("description"->>'th') = ' '));

-- Update Promotions collection (including localized fields)
UPDATE "promotions" 
SET 
  -- Handle localized fields (stored as JSON objects)
  "title" = CASE 
    WHEN "title" = '' OR "title" = ' ' THEN NULL 
    WHEN jsonb_typeof("title") = 'object' THEN
      CASE 
        WHEN ("title"->>'en') = '' OR ("title"->>'en') = ' ' THEN 
          jsonb_set("title", '{en}', 'null'::jsonb)
        WHEN ("title"->>'th') = '' OR ("title"->>'th') = ' ' THEN 
          jsonb_set("title", '{th}', 'null'::jsonb)
        ELSE "title"
      END
    ELSE "title" 
  END,
  
  "subtitle" = CASE 
    WHEN "subtitle" = '' OR "subtitle" = ' ' THEN NULL 
    WHEN jsonb_typeof("subtitle") = 'object' THEN
      CASE 
        WHEN ("subtitle"->>'en') = '' OR ("subtitle"->>'en') = ' ' THEN 
          jsonb_set("subtitle", '{en}', 'null'::jsonb)
        WHEN ("subtitle"->>'th') = '' OR ("subtitle"->>'th') = ' ' THEN 
          jsonb_set("subtitle", '{th}', 'null'::jsonb)
        ELSE "subtitle"
      END
    ELSE "subtitle" 
  END,
  
  "description" = CASE 
    WHEN "description" = '' OR "description" = ' ' THEN NULL 
    WHEN jsonb_typeof("description") = 'object' THEN
      CASE 
        WHEN ("description"->>'en') = '' OR ("description"->>'en') = ' ' THEN 
          jsonb_set("description", '{en}', 'null'::jsonb)
        WHEN ("description"->>'th') = '' OR ("description"->>'th') = ' ' THEN 
          jsonb_set("description", '{th}', 'null'::jsonb)
        ELSE "description"
      END
    ELSE "description" 
  END,
  
  -- Non-localized fields
  "highlight" = CASE WHEN "highlight" = '' OR "highlight" = ' ' THEN NULL ELSE "highlight" END,
  "section_highlight" = CASE WHEN "section_highlight" = '' OR "section_highlight" = ' ' THEN NULL ELSE "section_highlight" END,
  "short_alphabet" = CASE WHEN "short_alphabet" = '' OR "short_alphabet" = ' ' THEN NULL ELSE "short_alphabet" END,
  "show_time" = CASE WHEN "show_time" = '' OR "show_time" = ' ' THEN NULL ELSE "show_time" END,
  "promotion_type" = CASE WHEN "promotion_type" = '' OR "promotion_type" = ' ' THEN NULL ELSE "promotion_type" END,
  
  -- Nested fields
  "meta" = CASE 
    WHEN ("meta"->>'title') = '' OR ("meta"->>'title') = ' ' THEN 
      jsonb_set("meta", '{title}', 'null'::jsonb)
    WHEN ("meta"->>'description') = '' OR ("meta"->>'description') = ' ' THEN 
      jsonb_set("meta", '{description}', 'null'::jsonb)
    WHEN ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ' THEN 
      jsonb_set("meta", '{keywords}', 'null'::jsonb)
    ELSE "meta" 
  END
WHERE 
  -- Check for empty values in any of the fields
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
  ("meta"->>'keywords') = '' OR ("meta"->>'keywords') = ' ' OR
  -- Check localized fields
  (jsonb_typeof("title") = 'object' AND (("title"->>'en') = '' OR ("title"->>'en') = ' ' OR ("title"->>'th') = '' OR ("title"->>'th') = ' ')) OR
  (jsonb_typeof("subtitle") = 'object' AND (("subtitle"->>'en') = '' OR ("subtitle"->>'en') = ' ' OR ("subtitle"->>'th') = '' OR ("subtitle"->>'th') = ' ')) OR
  (jsonb_typeof("description") = 'object' AND (("description"->>'en') = '' OR ("description"->>'en') = ' ' OR ("description"->>'th') = '' OR ("description"->>'th') = ' '));

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