#!/bin/bash

# Database import script with progress monitoring
# Usage: ./scripts/import-with-progress.sh [target-db-details]

# Default database connection details (modify these for your target database)
TARGET_HOST="${TARGET_HOST:-icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com}"
TARGET_PORT="${TARGET_PORT:-5432}"
TARGET_DB="${TARGET_DB:-iconsiam_web_dev}"
TARGET_USER="${TARGET_USER:-iconsiamWebDB}"
TARGET_PASS="${TARGET_PASS:-iconsiamDocDB888!}"
DUMP_FILE="${DUMP_FILE:-exports/dump_final_cascade.sql}"

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --host HOST          Target database host"
    echo "  --port PORT          Target database port"
    echo "  --db DATABASE        Target database name"
    echo "  --user USER          Target database user"
    echo "  --pass PASSWORD      Target database password"
    echo "  --file FILE          Dump file to import"
    echo "  --dry-run            Show what would be executed"
    echo ""
    echo "Environment Variables:"
    echo "  TARGET_HOST, TARGET_PORT, TARGET_DB, TARGET_USER, TARGET_PASS, DUMP_FILE"
    echo ""
    echo "Examples:"
    echo "  # Use default settings"
    echo "  $0"
    echo ""
    echo "  # Override connection details"
    echo "  TARGET_HOST=my-db.example.com TARGET_USER=myuser $0"
    echo ""
    echo "  # Use command line options"
    echo "  $0 --host my-db.example.com --user myuser --db mydatabase"
}

# Parse command line arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            TARGET_HOST="$2"
            shift 2
            ;;
        --port)
            TARGET_PORT="$2"
            shift 2
            ;;
        --db)
            TARGET_DB="$2"
            shift 2
            ;;
        --user)
            TARGET_USER="$2"
            shift 2
            ;;
        --pass)
            TARGET_PASS="$2"
            shift 2
            ;;
        --file)
            DUMP_FILE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
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

# Check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Error: Dump file not found: $DUMP_FILE"
    exit 1
fi

# Show import details
echo "📋 Import Details:"
echo "  Host: $TARGET_HOST"
echo "  Port: $TARGET_PORT"
echo "  Database: $TARGET_DB"
echo "  User: $TARGET_USER"
echo "  Dump file: $DUMP_FILE"
echo "  File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

# Check database connection
echo "🔍 Testing database connection..."
if ! psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database"
    echo "Please check your connection details and try again."
    exit 1
fi
echo "✅ Database connection successful"
echo ""

# Show what will be imported
echo "📊 Dump file analysis:"
echo "  Tables to be created:"
grep -c "CREATE TABLE" "$DUMP_FILE" | xargs echo "    - Tables:"
grep -c "COPY public\." "$DUMP_FILE" | xargs echo "    - Data copy operations:"
echo ""

# Confirm before proceeding
if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN - Would execute:"
    echo "psql -h $TARGET_HOST -p $TARGET_PORT -U $TARGET_USER -d $TARGET_DB -f $DUMP_FILE"
    exit 0
fi

echo "⚠️  WARNING: This will drop existing tables and recreate them!"
echo "   Make sure you have a backup of your target database."
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Import cancelled"
    exit 1
fi

# Start the import with progress monitoring
echo "🚀 Starting import..."
echo "   This may take several minutes for 13MB of data."
echo "   You can monitor progress in another terminal with:"
echo "   psql -h $TARGET_HOST -U $TARGET_USER -d $TARGET_DB -c \"SELECT pid, query_start, state FROM pg_stat_activity WHERE state = 'active';\""
echo ""

# Set environment variable for password
export PGPASSWORD="$TARGET_PASS"

# Import with timing
time psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -f "$DUMP_FILE"

# Check result
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import completed successfully!"
    echo ""
    echo "📊 Verification:"
    echo "  Checking imported tables..."
    psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -c "
    SELECT 
        schemaname, 
        tablename, 
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename) as exists
    FROM pg_tables 
    WHERE tablename IN ('events', 'promotions', 'events_keywords', 'promotions_keywords', 'events_locales', 'promotions_locales', 'events_rels', 'promotions_rels')
    ORDER BY tablename;
    "
else
    echo ""
    echo "❌ Import failed!"
    echo "Check the error messages above for details."
    exit 1
fi 