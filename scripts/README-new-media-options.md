# New Media Records Options - Complete Guide

## 🎯 **Your Question**: "What if all images ref from promotions and events I want to create new media?"

Great question! You have several options for handling media records when migrating events and promotions. Here are the different approaches:

## 📋 **Option 1: Keep Original Media (Current Dump)**

**File**: `exports/dump_with_media_cascade.sql` (14MB)

### What it does:

- ✅ Includes all original media records (2,051 records)
- ✅ Preserves exact same media IDs
- ✅ No broken image references
- ✅ Works immediately after import

### When to use:

- You want to keep the exact same media records
- You don't need to change media IDs
- You want the simplest migration

### Import command:

```bash
psql -h your-target-host -U your-username -d your-database-name -f exports/dump_with_media_cascade.sql
```

## 🆕 **Option 2: Create New Media Records (Recommended)**

### Step 1: Create dump without original media

```bash
./scripts/db-dump-without-media.sh --extract-media-info
```

This creates:

- `exports/dump_without_media_TIMESTAMP.sql` - Events/promotions without media
- `exports/media_info_for_new_media_TIMESTAMP.sql` - Media info for new records

### Step 2: Import the dump

```bash
psql -h your-target-host -U your-username -d your-database-name -f exports/dump_without_media_TIMESTAMP.sql
```

### Step 3: Create new media records

```bash
psql -h your-target-host -U your-username -d your-database-name -f scripts/create-new-media-records.sql
```

### What this does:

- ✅ Creates new media records with new IDs
- ✅ Keeps same image URLs and metadata
- ✅ Updates all foreign key references
- ✅ Gives you clean, new media IDs

## 🔄 **Option 3: Manual Media Creation**

### Step 1: Extract media information

```bash
./scripts/db-dump-without-media.sh --extract-media-info
```

### Step 2: Review the media info

```bash
cat exports/media_info_for_new_media_TIMESTAMP.sql
```

### Step 3: Create new media records manually

```sql
-- Example: Create new media record
INSERT INTO media (id, filename, mime_type, filesize, width, height, url, alt, created_at, updated_at)
VALUES (
    nextval('media_id_seq'),
    'new_event_banner.jpg',
    'image/jpeg',
    142241,
    800,
    600,
    'https://your-new-domain.com/images/new_event_banner.jpg',
    'New Event Banner',
    NOW(),
    NOW()
);
```

## 📊 **Comparison of Options**

| Option       | Media Records    | File Size | Complexity | Media IDs |
| ------------ | ---------------- | --------- | ---------- | --------- |
| **Option 1** | Original (2,051) | 14MB      | Simple     | Same      |
| **Option 2** | New (2,051)      | ~12MB     | Medium     | New       |
| **Option 3** | Custom           | ~12MB     | High       | Custom    |

## 🚀 **Recommended Workflow**

### For New Media Records (Option 2):

```bash
# 1. Create dump without media + extract media info
./scripts/db-dump-without-media.sh --extract-media-info

# 2. Import to target database
psql -h your-target-host -U your-username -d your-database-name -f exports/dump_without_media_*.sql

# 3. Create new media records
psql -h your-target-host -U your-username -d your-database-name -f scripts/create-new-media-records.sql

# 4. Verify the migration
psql -h your-target-host -U your-username -d your-database-name -c "
SELECT
    'Events with images' as info,
    COUNT(*) as count
FROM events_locales
WHERE images_cover_photo_id IS NOT NULL
   OR images_facebook_image_id IS NOT NULL
   OR images_thumbnail_id IS NOT NULL;
"
```

## 🔍 **What the New Media Script Does**

The `create-new-media-records.sql` script:

1. **Identifies all media** referenced by events and promotions
2. **Creates new media records** with new IDs but same metadata
3. **Updates foreign keys** in events_locales and promotions_locales
4. **Preserves image URLs** and metadata
5. **Shows migration summary** with statistics

## ⚠️ **Important Considerations**

### Before Choosing Option 2 or 3:

- **Image URLs**: Will you keep the same URLs or change them?
- **File storage**: Are images stored locally or in cloud storage?
- **CDN**: Do you need to update CDN references?
- **Backup**: Always backup before running media migration scripts

### If Images are Stored Locally:

```bash
# You might need to copy image files to new location
# Update URLs in the media records accordingly
```

### If Images are in Cloud Storage (S3, etc.):

```bash
# URLs might remain the same
# Just the database IDs will change
```

## 🎯 **Quick Decision Guide**

### Choose Option 1 (Original Media) if:

- ✅ You want the simplest migration
- ✅ You don't need new media IDs
- ✅ Images are already in the right place

### Choose Option 2 (New Media Records) if:

- ✅ You want clean, new media IDs
- ✅ You want to separate media from original database
- ✅ You're okay with same image URLs

### Choose Option 3 (Manual) if:

- ✅ You want to change image URLs
- ✅ You need custom media metadata
- ✅ You want full control over the process

## 📝 **Next Steps**

1. **Decide which option** fits your needs
2. **Run the appropriate script** for your choice
3. **Test the migration** on a copy first
4. **Verify image references** work correctly
5. **Update application** if needed

**Which option would you like to proceed with?** 🤔
