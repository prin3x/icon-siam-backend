# Example Usage: Promotion Patching Script

This guide shows you how to use the promotion patching script step by step.

## Prerequisites

1. **JSON Data File**: Ensure you have `data/promotions-table-export-2.json` in your project
2. **Database**: Make sure your PostgreSQL database is running
3. **Environment**: Verify your `.env` file has the correct database credentials

## Step 1: Validate Your Data

First, validate your JSON data to ensure it's properly formatted:

```bash
# Using pnpm (recommended)
pnpm run validate-promotions

# Expected output:
# Reading file: /path/to/data/promotions-table-export-2.json
# ✅ JSON file read successfully
# ✅ JSON parsed successfully
# 📊 Found 150 promotions to validate
# Progress: 100/150 records validated
# 📋 Validation Summary:
# ✅ Valid records: 150
# ❌ Invalid records: 0
# 📊 Total records: 150
# 🎉 All records are valid! You can now run the patch script.
```

If you see validation errors, fix them before proceeding.

## Step 2: Run the Patch Script

Once validation passes, run the patch script:

```bash
# Using pnpm (recommended)
pnpm run patch-promotions

# Expected output:
# Found 150 promotions to process
# Updated promotion ID: 1
# Created promotion ID: 2
# Updated promotion ID: 3
# ...
# Processing complete:
# - Updated: 120
# - Created: 30
# - Errors: 0
```

## Step 3: Verify Results

Check your Payload CMS admin panel to verify the promotions have been updated correctly.

## Example JSON Structure

Your JSON file should look like this:

```json
[
  {
    "id": 1,
    "slug": "example-promotion",
    "title_th": "โปรโมชั่นตัวอย่าง",
    "title_en": "Example Promotion",
    "title_cn": "示例促销",
    "sub_title_th": "คำอธิบายย่อย",
    "sub_title_en": "Subtitle",
    "sub_title_cn": "副标题",
    "description_th": "คำอธิบายโปรโมชั่น",
    "description_en": "Promotion description",
    "description_cn": "促销说明",
    "text_th": "<p>เนื้อหาของโปรโมชั่น</p>",
    "text_en": "<p>Promotion content</p>",
    "text_cn": "<p>促销内容</p>",
    "seo_keyword_th": "โปรโมชั่น, ตัวอย่าง",
    "seo_keyword_en": "promotion, example",
    "seo_keyword_cn": "促销, 示例",
    "seo_desc_th": "คำอธิบาย SEO",
    "seo_desc_en": "SEO description",
    "seo_desc_cn": "SEO 描述",
    "cid": "category-id",
    "scid": "subcategory-id",
    "image_thumbnail": "https://example.com/thumbnail.jpg",
    "cover_photo": "https://example.com/cover.jpg",
    "facebook_image_url": "https://example.com/facebook.jpg",
    "highlight": "Highlight text",
    "section_highlight": "Section highlight",
    "short_alphabet": "EP",
    "promotion_type": "promotion",
    "tags": "tag1,tag2",
    "related_content": "",
    "related_content_promotion": "",
    "create_by": "admin",
    "showDateStart": "2024-01-01",
    "showDateEnd": "2024-12-31",
    "showTime": "10:00-22:00",
    "created_at": "2024-01-01 10:00:00",
    "modified_at": "2024-01-01 10:00:00",
    "start_date": "2024-01-01 00:00:00",
    "end_date": "2024-12-31 23:59:59",
    "active": 1,
    "pin_to_home": 0,
    "pin_to_section": 0,
    "sort": 1
  }
]
```

## Troubleshooting

### Common Issues

1. **"JSON file not found"**
   - Ensure the file is in `data/promotions-table-export-2.json`
   - Check file permissions

2. **"Failed to parse JSON"**
   - Validate your JSON syntax using a JSON validator
   - Check for missing commas, brackets, or quotes

3. **"Database connection failed"**
   - Verify your `.env` file has correct database credentials
   - Ensure the database is running

4. **"Validation errors"**
   - Fix the data structure issues reported by the validation script
   - Ensure all required fields are present and have correct types

### Debug Mode

To see more detailed output, you can modify the script to add more logging:

```typescript
// In patch-promotions.ts, add this line for more verbose logging
console.log('Processing promotion:', JSON.stringify(promotionData, null, 2))
```

## Rollback

If something goes wrong, you can:

1. **Check the logs** to see which records were processed
2. **Use database backups** if available
3. **Manually fix individual records** through the Payload admin panel

## Performance Tips

- For large datasets (>1000 records), consider processing in batches
- Monitor database performance during the import
- Consider running during off-peak hours

## Support

If you encounter issues:

1. Check the validation output first
2. Review the error messages in the console
3. Verify your data structure matches the expected format
4. Check the Payload CMS logs for additional error details
