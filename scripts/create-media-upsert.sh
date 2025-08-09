#!/bin/bash

# Create UPSERT dump for media records
# This script creates a proper PostgreSQL UPSERT dump

# Default database connection details
DB_HOST="${DB_HOST:-icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-iconsiam_web_dev}"
DB_USER="${DB_USER:-iconsiamWebDB}"
DB_PASS="${DB_PASS:-iconsiamDocDB888!}"

# Create exports directory if it doesn't exist
mkdir -p exports

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="exports/dump_all_media_upsert_${TIMESTAMP}.sql"

echo "📋 Creating UPSERT dump for ALL media records..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $OUTPUT_FILE"
echo ""

# Create the UPSERT dump
echo "🚀 Generating UPSERT dump..."

# Create header
cat > "$OUTPUT_FILE" << 'EOF'
-- Media UPSERT dump
-- This will update existing records and insert new ones
-- Run this on a database that already has the media table structure

-- UPSERT all media records
-- This will update existing records and insert new ones
INSERT INTO public.media (id, alt_en, alt_th, alt_zh, prefix, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y)
VALUES
EOF

# Get all media records and format them for UPSERT
echo "📊 Extracting media records..."

# Create a temporary file for the CSV data
TEMP_CSV="${OUTPUT_FILE}.csv"

# Extract CSV data
docker-compose run --rm db-dump psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "
COPY (
    SELECT 
        id,
        COALESCE(alt_en, '') as alt_en,
        COALESCE(alt_th, '') as alt_th,
        COALESCE(alt_zh, '') as alt_zh,
        COALESCE(prefix, '') as prefix,
        updated_at,
        created_at,
        COALESCE(url, '') as url,
        COALESCE(thumbnail_u_r_l, '') as thumbnail_u_r_l,
        COALESCE(filename, '') as filename,
        COALESCE(mime_type, '') as mime_type,
        COALESCE(filesize, 0) as filesize,
        COALESCE(width, 0) as width,
        COALESCE(height, 0) as height,
        COALESCE(focal_x, 0) as focal_x,
        COALESCE(focal_y, 0) as focal_y
    FROM media 
    ORDER BY id
) TO STDOUT WITH CSV;
" > "$TEMP_CSV"

# Convert CSV to PostgreSQL VALUES format using Python for proper CSV parsing
echo "🔧 Converting CSV to PostgreSQL VALUES format..."
python3 -c "
import csv
import sys

with open('$TEMP_CSV', 'r') as csvfile:
    reader = csv.reader(csvfile)
    first = True
    
    for row in reader:
        if not first:
            print(',')
        else:
            first = False
        
        # Start the VALUES row
        print('(', end='')
        
        # Process each field
        for i, field in enumerate(row):
            if i > 0:
                print(', ', end='')
            
            # Handle different data types
            if i == 0:
                # ID field - no quotes
                print(field, end='')
            elif i == 5 or i == 6:
                # Timestamp fields - quote and escape
                escaped = field.replace('\"', '\\\"')
                print(f\"'{escaped}'\", end='')
            elif i == 12 or i == 13 or i == 14 or i == 15 or i == 16:
                # Numeric fields - no quotes
                print(field, end='')
            else:
                # String fields - quote and escape
                escaped = field.replace('\"', '\\\"')
                print(f\"'{escaped}'\", end='')
        
        # End the VALUES row
        print(')', end='')
" >> "$OUTPUT_FILE"

# Add ON CONFLICT clause
cat >> "$OUTPUT_FILE" << 'EOF'
ON CONFLICT (id) DO UPDATE SET
    alt_en = EXCLUDED.alt_en,
    alt_th = EXCLUDED.alt_th,
    alt_zh = EXCLUDED.alt_zh,
    prefix = EXCLUDED.prefix,
    updated_at = EXCLUDED.updated_at,
    created_at = EXCLUDED.created_at,
    url = EXCLUDED.url,
    thumbnail_u_r_l = EXCLUDED.thumbnail_u_r_l,
    filename = EXCLUDED.filename,
    mime_type = EXCLUDED.mime_type,
    filesize = EXCLUDED.filesize,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    focal_x = EXCLUDED.focal_x,
    focal_y = EXCLUDED.focal_y;

-- Reset sequence to max ID
SELECT setval('public.media_id_seq', (SELECT MAX(id) FROM public.media), true);
EOF

# Clean up temporary file
rm -f "$TEMP_CSV"

if [ $? -eq 0 ]; then
    echo "✅ UPSERT dump created successfully!"
    echo "📁 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    
    # Show dump statistics
    echo "📄 Dump file analysis:"
    echo "  UPSERT statements: $(grep -c "INSERT INTO public.media" "$OUTPUT_FILE")"
    echo "  ON CONFLICT clauses: $(grep -c "ON CONFLICT" "$OUTPUT_FILE")"
    echo "  VALUES rows: $(grep -c "^(" "$OUTPUT_FILE")"
    echo ""
    
    echo "📝 Import Commands:"
    echo ""
    echo "  # Import to target database"
    echo "  psql -h your-target-host -U your-username -d your-database-name -f $OUTPUT_FILE"
    echo ""
    echo "  # This will UPSERT media records"
    echo "  # Existing media with same IDs will be updated"
    echo "  # New media will be inserted"
    echo "  # Requires media table to already exist in destination"
    
else
    echo "❌ UPSERT dump creation failed!"
    exit 1
fi 