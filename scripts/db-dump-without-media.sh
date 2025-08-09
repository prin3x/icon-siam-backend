#!/bin/bash

# Database dump script for events and promotions WITHOUT original media
# This allows you to create new media records for the images

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
    echo "This script creates a dump of events and promotions WITHOUT the original media table."
    echo "You can then create new media records for the images."
    echo ""
    echo "Options:"
    echo "  --host HOST          Database host"
    echo "  --port PORT          Database port"
    echo "  --db DATABASE        Database name"
    echo "  --user USER          Database user"
    echo "  --pass PASSWORD      Database password"
    echo "  --output-file FILE   Specify output filename"
    echo "  --extract-media-info Extract media info for new media creation"
    echo ""
    echo "Examples:"
    echo "  # Create dump without media"
    echo "  $0"
    echo ""
    echo "  # Extract media info for new media creation"
    echo "  $0 --extract-media-info"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Check for special flags
EXTRACT_MEDIA_INFO=false
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
        --extract-media-info)
            EXTRACT_MEDIA_INFO=true
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
    OUTPUT_FILE="exports/dump_without_media_${TIMESTAMP}.sql"
fi

echo "📋 Creating dump WITHOUT original media table..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $OUTPUT_FILE"
echo ""

# Create dump without media table
echo "🚀 Creating dump..."
docker-compose run --rm db-dump pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --table=events \
    --table=events_keywords \
    --table=events_locales \
    --table=events_rels \
    --table=promotions \
    --table=promotions_keywords \
    --table=promotions_locales \
    --table=promotions_rels \
    > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Dump created successfully!"
    echo "📁 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "⚠️  Note: This dump does NOT include the media table."
    echo "   You'll need to create new media records for the images."
    echo ""
    
    if [ "$EXTRACT_MEDIA_INFO" = true ]; then
        echo "📊 Extracting media information for new media creation..."
        
        # Extract media info to a separate file
        MEDIA_INFO_FILE="exports/media_info_for_new_media_${TIMESTAMP}.sql"
        
        docker-compose run --rm db-dump psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -c "
        -- Extract media information for events and promotions
        -- This can be used to create new media records
        
        SELECT DISTINCT 
            m.id as original_id,
            m.filename,
            m.mime_type,
            m.filesize,
            m.width,
            m.height,
            m.url,
            m.alt,
            'events' as source_table
        FROM media m
        JOIN events_locales el ON m.id IN (
            el.images_cover_photo_id, 
            el.images_facebook_image_id, 
            el.images_thumbnail_id
        )
        UNION
        SELECT DISTINCT 
            m.id as original_id,
            m.filename,
            m.mime_type,
            m.filesize,
            m.width,
            m.height,
            m.url,
            m.alt,
            'promotions' as source_table
        FROM media m
        JOIN promotions_locales pl ON m.id IN (
            pl.images_cover_photo_id, 
            pl.images_facebook_image_id, 
            pl.images_thumbnail_id
        )
        ORDER BY original_id;
        " > "$MEDIA_INFO_FILE"
        
        echo "📄 Media info extracted to: $MEDIA_INFO_FILE"
        echo "   This contains all the media information you need to create new media records."
    fi
    
    echo ""
    echo "📝 Next Steps:"
    echo "1. Import this dump to your target database"
    echo "2. Create new media records using the media info (if extracted)"
    echo "3. Update the foreign key references to point to new media IDs"
    echo ""
    echo "💡 Tip: Use the create-new-media-records.sql script to automate step 2 and 3."
    
else
    echo "❌ Dump creation failed!"
    exit 1
fi 