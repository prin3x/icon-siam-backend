#!/bin/bash

# Database dump script for ALL media records
# Usage: ./scripts/db-dump-all-media.sh [options]

# Default database connection details
DB_HOST="${DB_HOST:-icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-iconsiam_web_dev}"
DB_USER="${DB_USER:-iconsiamWebDB}"
DB_PASS="${DB_PASS:-iconsiamDocDB888!}"
DB_SSL_MODE="${DB_SSL_MODE:-require}"

# Create exports directory if it doesn't exist
mkdir -p exports

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "This script dumps ALL media records from the database."
    echo ""
    echo "Options:"
    echo "  --host HOST          Database host"
    echo "  --port PORT          Database port"
    echo "  --db DATABASE        Database name"
    echo "  --user USER          Database user"
    echo "  --pass PASSWORD      Database password"
    echo "  --output-file FILE   Specify output filename"
    echo "  --replace            Create dump with UPSERT instead of DROP"
    echo "  --stats-only         Show media statistics only"
    echo ""
    echo "Examples:"
    echo "  # Dump all media with DROP statements"
    echo "  $0"
    echo ""
    echo "  # Dump all media with UPSERT statements"
    echo "  $0 --replace"
    echo ""
    echo "  # Show media statistics"
    echo "  $0 --stats-only"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Check for special flags
REPLACE_MODE=false
STATS_ONLY=false
OUTPUT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            DB_HOST="$2"
            shift 2
            ;;
        --port)
            DB_PORT="$2"
            shift 2
            ;;
        --db)
            DB_NAME="$2"
            shift 2
            ;;
        --user)
            DB_USER="$2"
            shift 2
            ;;
        --pass)
            DB_PASS="$2"
            shift 2
            ;;
        --output-file)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --replace)
            REPLACE_MODE=true
            shift
            ;;
        --stats-only)
            STATS_ONLY=true
            shift
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set output file
if [ -z "$OUTPUT_FILE" ]; then
    if [ "$REPLACE_MODE" = true ]; then
        OUTPUT_FILE="exports/dump_all_media_upsert_${TIMESTAMP}.sql"
    else
        OUTPUT_FILE="exports/dump_all_media_${TIMESTAMP}.sql"
    fi
fi

echo "📋 Creating dump of ALL media records..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $OUTPUT_FILE"
echo "  Mode: $([ "$REPLACE_MODE" = true ] && echo "UPSERT" || echo "DROP")"
echo ""

# Show media statistics
echo "📊 Media Statistics:"
docker-compose run --rm db-dump psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "
SELECT 
    'Total media records' as info,
    COUNT(*) as count
FROM media
UNION ALL
SELECT 
    'Media by type' as info,
    COUNT(*) as count
FROM media 
GROUP BY mime_type
ORDER BY count DESC;
"

if [ "$STATS_ONLY" = true ]; then
    echo ""
    echo "📊 Detailed Media Analysis:"
    docker-compose run --rm db-dump psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
    SELECT 
        mime_type,
        COUNT(*) as count,
        pg_size_pretty(SUM(filesize)) as total_size,
        AVG(filesize)::integer as avg_size
    FROM media 
    GROUP BY mime_type 
    ORDER BY count DESC;
    "
    exit 0
fi

# Check how many tables depend on media
echo ""
echo "🔍 Checking media dependencies..."
DEPENDENT_TABLES=$(docker-compose run --rm db-dump psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "
SELECT COUNT(DISTINCT tc.table_name) as dependent_tables
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'media';
" | tail -1 | xargs)

echo "  Found $DEPENDENT_TABLES tables that depend on media"
echo ""

# Create dump
echo "🚀 Creating media dump..."

if [ "$REPLACE_MODE" = true ]; then
    echo "  Using UPSERT mode (will update existing media records)"
    
    # Create dump with data-only (no schema)
    docker-compose run --rm db-dump pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --data-only \
        --table=media \
        > "${OUTPUT_FILE}.raw"
    
    # Post-process to add UPSERT statements
    echo "🔧 Converting to UPSERT statements..."
    
    # Create a temporary file for processing
    TEMP_FILE="${OUTPUT_FILE}.tmp"
    
    # Add UPSERT header
    cat > "$TEMP_FILE" << 'EOF'
-- Media UPSERT dump
-- This will update existing records and insert new ones
-- Run this on a database that already has the media table structure

EOF

    # Extract the first INSERT statement to get column list
    FIRST_INSERT=$(grep "INSERT INTO public.media" "${OUTPUT_FILE}.raw" | head -1)
    
    # Extract column list from the first INSERT
    COLUMN_LIST=$(echo "$FIRST_INSERT" | sed 's/INSERT INTO public.media (\([^)]*\)).*/\1/')
    
    # Create UPSERT template
    cat >> "$TEMP_FILE" << EOF
-- UPSERT all media records
-- This will update existing records and insert new ones
INSERT INTO public.media $COLUMN_LIST
EOF

    # Extract all the VALUES from the original file and add them
    grep "INSERT INTO public.media" "${OUTPUT_FILE}.raw" | sed 's/INSERT INTO public.media[^)]*VALUES //' >> "$TEMP_FILE"
    
    # Add ON CONFLICT clause
    cat >> "$TEMP_FILE" << 'EOF'
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
EOF

    # Replace original file and clean up
    mv "$TEMP_FILE" "$OUTPUT_FILE"
    rm -f "${OUTPUT_FILE}.raw"
    
else
    echo "  Using DROP mode (will drop and recreate media table)"
    
    # Create dump with CASCADE support
    docker-compose run --rm db-dump pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --table=media \
        > "$OUTPUT_FILE"
    
    # Add CASCADE to DROP statements
    echo "🔧 Adding CASCADE to DROP statements..."
    sed -i.bak 's/DROP TABLE IF EXISTS public\.\([^;]*\);/DROP TABLE IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
    sed -i.bak 's/DROP INDEX IF EXISTS public\.\([^;]*\);/DROP INDEX IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
    sed -i.bak 's/DROP SEQUENCE IF EXISTS public\.\([^;]*\);/DROP SEQUENCE IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
    sed -i.bak 's/DROP CONSTRAINT IF EXISTS \([^;]*\);/DROP CONSTRAINT IF EXISTS \1 CASCADE;/g' "$OUTPUT_FILE"
    rm -f "$OUTPUT_FILE.bak"
fi

if [ $? -eq 0 ]; then
    echo "✅ Media dump created successfully!"
    echo "📁 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    
    # Show dump statistics
    echo "📄 Dump file analysis:"
    if [ "$REPLACE_MODE" = true ]; then
        echo "  UPSERT statements: $(grep -c "INSERT INTO public.media" "$OUTPUT_FILE" || echo "0")"
        echo "  ON CONFLICT clauses: $(grep -c "ON CONFLICT" "$OUTPUT_FILE")"
        echo "  VALUES lines: $(grep -c "VALUES" "$OUTPUT_FILE")"
    else
        echo "  Media records: $(grep -c "INSERT INTO public.media" "$OUTPUT_FILE" || echo "0")"
        echo "  DROP statements: $(grep -c "DROP" "$OUTPUT_FILE")"
        echo "  CASCADE statements: $(grep -c "CASCADE" "$OUTPUT_FILE")"
    fi
    echo ""
    
    echo "📝 Import Commands:"
    echo ""
    echo "  # Import to target database"
    echo "  psql -h your-target-host -U your-username -d your-database-name -f $OUTPUT_FILE"
    echo ""
    
    if [ "$REPLACE_MODE" = true ]; then
        echo "  # This will UPSERT media records"
        echo "  # Existing media with same IDs will be updated"
        echo "  # New media will be inserted"
        echo "  # Requires media table to already exist in destination"
    else
        echo "  # This will DROP and recreate the media table"
        echo "  # All existing media will be replaced"
        echo "  # Foreign key constraints will be handled with CASCADE"
    fi
    
else
    echo "❌ Media dump creation failed!"
    exit 1
fi 