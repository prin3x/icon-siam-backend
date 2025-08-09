#!/bin/bash

# Dump entire database
# This script creates a complete dump of all tables, schema, and data

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
OUTPUT_FILE="exports/dump_entire_db_${TIMESTAMP}.sql"

echo "📋 Creating complete database dump..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $OUTPUT_FILE"
echo ""

# Get database statistics first
echo "📊 Getting database statistics..."
TABLE_COUNT=$(docker-compose run --rm db-dump psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t \
    -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "  Found $TABLE_COUNT tables in database"
echo ""

# List all tables
echo "📋 Tables to be dumped:"
docker-compose run --rm db-dump psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | grep -v "table_name" | grep -v "^-" | grep -v "^$"

echo ""
echo "🚀 Creating complete database dump..."

# Create the complete dump
docker-compose run --rm db-dump pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    --file="$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Complete database dump created successfully!"
    echo "📁 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    
    # Show dump statistics
    echo "📄 Dump file analysis:"
    echo "  Total lines: $(wc -l < "$OUTPUT_FILE")"
    echo "  CREATE TABLE statements: $(grep -c "CREATE TABLE" "$OUTPUT_FILE")"
    echo "  INSERT statements: $(grep -c "INSERT INTO" "$OUTPUT_FILE")"
    echo "  DROP statements: $(grep -c "DROP TABLE" "$OUTPUT_FILE")"
    echo "  ALTER statements: $(grep -c "ALTER TABLE" "$OUTPUT_FILE")"
    echo ""
    
    echo "📝 Import Commands:"
    echo ""
    echo "  # Import to target database (complete restore)"
    echo "  psql -h your-target-host -U your-username -d your-database-name -f $OUTPUT_FILE"
    echo ""
    echo "  # This will:"
    echo "  # - Drop existing tables (if they exist)"
    echo "  # - Create all tables with proper schema"
    echo "  # - Insert all data"
    echo "  # - Set up all indexes and constraints"
    echo "  # - Reset all sequences"
    echo ""
    echo "⚠️  WARNING: This will completely replace the target database!"
    echo "   Make sure to backup your target database first."
    
else
    echo "❌ Database dump creation failed!"
    exit 1
fi 