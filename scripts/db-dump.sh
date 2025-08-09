#!/bin/bash

# Database dump script for ICONSIAM PostgreSQL database
# Usage: ./scripts/db-dump.sh [table1] [table2] [table3] ...

# Database connection details
DB_HOST="icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="iconsiam_web_dev"
DB_USER="iconsiamWebDB"
DB_PASS="iconsiamDocDB888!"

# Create exports directory if it doesn't exist
mkdir -p exports

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ $# -eq 0 ]; then
    echo "Usage: $0 [table1] [table2] [table3] ..."
    echo "Example: $0 users events promotions"
    echo ""
    echo "Available options:"
    echo "  --all-tables    Dump all tables"
    echo "  --schema-only   Dump schema only (no data)"
    echo "  --data-only     Dump data only (no schema)"
    echo "  --list-tables   List all available tables"
    exit 1
fi

# Check for special flags
SCHEMA_ONLY=false
DATA_ONLY=false
LIST_TABLES=false
ALL_TABLES=false

TABLES=()
for arg in "$@"; do
    case $arg in
        --schema-only)
            SCHEMA_ONLY=true
            ;;
        --data-only)
            DATA_ONLY=true
            ;;
        --list-tables)
            LIST_TABLES=true
            ;;
        --all-tables)
            ALL_TABLES=true
            ;;
        *)
            TABLES+=("$arg")
            ;;
    esac
done

# Function to list all tables
list_tables() {
    echo "Available tables in database:"
    docker-compose run --rm db-dump psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt" | grep -v "List of relations" | grep -v "Schema" | grep -v "Name" | grep -v "Type" | grep -v "Owner" | grep -v "^$" | sed 's/^[[:space:]]*//'
}

# Function to dump specific tables
dump_tables() {
    local output_file="exports/dump_${TIMESTAMP}.sql"
    local pg_dump_cmd="docker-compose run --rm db-dump pg_dump"
    
    # Add connection parameters
    pg_dump_cmd="$pg_dump_cmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    
    # Add dump options
    if [ "$SCHEMA_ONLY" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --schema-only"
    elif [ "$DATA_ONLY" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --data-only"
    fi
    
    # Add table parameters
    if [ "$ALL_TABLES" = true ]; then
        echo "Dumping all tables..."
    else
        for table in "${TABLES[@]}"; do
            pg_dump_cmd="$pg_dump_cmd --table=$table"
        done
    fi
    
    # Add output file
    pg_dump_cmd="$pg_dump_cmd > $output_file"
    
    echo "Executing: $pg_dump_cmd"
    eval $pg_dump_cmd
    
    if [ $? -eq 0 ]; then
        echo "✅ Database dump completed successfully!"
        echo "📁 Output file: $output_file"
        echo "📊 File size: $(du -h "$output_file" | cut -f1)"
    else
        echo "❌ Database dump failed!"
        exit 1
    fi
}

# Main execution
if [ "$LIST_TABLES" = true ]; then
    list_tables
elif [ "$ALL_TABLES" = true ] || [ ${#TABLES[@]} -gt 0 ]; then
    dump_tables
else
    echo "No tables specified. Use --all-tables or provide table names."
    exit 1
fi 