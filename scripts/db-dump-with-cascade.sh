#!/bin/bash

# Database dump script with CASCADE support for handling foreign key dependencies
# Usage: ./scripts/db-dump-with-cascade.sh [options] [table1] [table2] ...

# Default database connection details (can be overridden with environment variables)
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
    echo "Usage: $0 [options] [table1] [table2] ..."
    echo ""
    echo "This script creates dumps with CASCADE support for handling foreign key dependencies."
    echo ""
    echo "Options:"
    echo "  --host HOST          Database host (default: $DB_HOST)"
    echo "  --port PORT          Database port (default: $DB_PORT)"
    echo "  --db DATABASE        Database name (default: $DB_NAME)"
    echo "  --user USER          Database user (default: $DB_USER)"
    echo "  --pass PASSWORD      Database password (default: $DB_PASS)"
    echo "  --ssl-mode MODE      SSL mode (default: $DB_SSL_MODE)"
    echo "  --all-tables         Dump all tables"
    echo "  --schema-only        Dump schema only (no data)"
    echo "  --data-only          Dump data only (no schema) - NOTE: No DROP statements with data-only"
    echo "  --list-tables        List all available tables"
    echo "  --no-owner           Remove OWNER statements from dump"
    echo "  --no-privileges      Remove GRANT/REVOKE statements from dump"
    echo "  --if-exists          Use IF EXISTS with DROP statements (recommended)"
    echo "  --cascade            Use CASCADE with DROP statements (handles foreign keys)"
    echo "  --output-file FILE   Specify output filename"
    echo "  --show-deps          Show table dependencies before dumping"
    echo ""
    echo "Environment Variables:"
    echo "  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_SSL_MODE"
    echo ""
    echo "Examples:"
    echo "  # Dump with CASCADE support (recommended for complex schemas)"
    echo "  $0 --if-exists --cascade --no-owner --no-privileges users events"
    echo ""
    echo "  # Show dependencies first"
    echo "  $0 --show-deps events"
    echo ""
    echo "  # Dump all tables with CASCADE"
    echo "  $0 --all-tables --if-exists --cascade --no-owner --no-privileges"
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

# Check for special flags
SCHEMA_ONLY=false
DATA_ONLY=false
LIST_TABLES=false
ALL_TABLES=false
NO_OWNER=false
NO_PRIVILEGES=false
IF_EXISTS=false
CASCADE=false
SHOW_DEPS=false
OUTPUT_FILE=""

TABLES=()

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
        --ssl-mode)
            DB_SSL_MODE="$2"
            shift 2
            ;;
        --schema-only)
            SCHEMA_ONLY=true
            shift
            ;;
        --data-only)
            DATA_ONLY=true
            shift
            ;;
        --list-tables)
            LIST_TABLES=true
            shift
            ;;
        --all-tables)
            ALL_TABLES=true
            shift
            ;;
        --no-owner)
            NO_OWNER=true
            shift
            ;;
        --no-privileges)
            NO_PRIVILEGES=true
            shift
            ;;
        --if-exists)
            IF_EXISTS=true
            shift
            ;;
        --cascade)
            CASCADE=true
            shift
            ;;
        --show-deps)
            SHOW_DEPS=true
            shift
            ;;
        --output-file)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            TABLES+=("$1")
            shift
            ;;
    esac
done

# Function to list all tables
list_tables() {
    echo "Available tables in database:"
    echo "Host: $DB_HOST"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    echo ""
    
    docker-compose run --rm db-dump psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "\dt" | grep -v "List of relations" | grep -v "Schema" | grep -v "Name" | grep -v "Type" | grep -v "Owner" | grep -v "^$" | sed 's/^[[:space:]]*//'
}

# Function to show table dependencies
show_dependencies() {
    local table="$1"
    echo "🔍 Analyzing dependencies for table: $table"
    echo ""
    
    # Show foreign key constraints that reference this table
    echo "📋 Tables that depend on '$table' (foreign keys pointing to it):"
    docker-compose run --rm db-dump psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT 
            tc.table_name as dependent_table,
            kcu.column_name as dependent_column,
            ccu.table_name as referenced_table,
            ccu.column_name as referenced_column
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = '$table'
        ORDER BY tc.table_name, kcu.column_name;
        "
    
    # Show foreign key constraints that this table has
    echo "📋 Tables that '$table' depends on (foreign keys pointing from it):"
    docker-compose run --rm db-dump psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT 
            tc.table_name as table_name,
            kcu.column_name as column_name,
            ccu.table_name as referenced_table,
            ccu.column_name as referenced_column
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name = '$table'
        ORDER BY ccu.table_name, ccu.column_name;
        "
}

# Function to dump specific tables
dump_tables() {
    # Set output file
    if [ -z "$OUTPUT_FILE" ]; then
        OUTPUT_FILE="exports/dump_with_cascade_${TIMESTAMP}.sql"
    fi
    
    local pg_dump_cmd="docker-compose run --rm db-dump pg_dump"
    
    # Add connection parameters
    pg_dump_cmd="$pg_dump_cmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    
    # Add dump options
    if [ "$SCHEMA_ONLY" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --schema-only"
    elif [ "$DATA_ONLY" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --data-only"
        echo "⚠️  Warning: Using --data-only means no DROP statements will be included"
    fi
    
    # Add owner/privilege options
    if [ "$NO_OWNER" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --no-owner"
    fi
    
    if [ "$NO_PRIVILEGES" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --no-privileges"
    fi
    
    # Add clean options (DROP statements)
    if [ "$DATA_ONLY" = false ]; then
        pg_dump_cmd="$pg_dump_cmd --clean"
        
        if [ "$IF_EXISTS" = true ]; then
            pg_dump_cmd="$pg_dump_cmd --if-exists"
        fi
    fi
    
    # Add table parameters
    if [ "$ALL_TABLES" = true ]; then
        echo "Dumping all tables with DROP statements..."
    else
        for table in "${TABLES[@]}"; do
            pg_dump_cmd="$pg_dump_cmd --table=$table"
        done
    fi
    
    # Add output file
    pg_dump_cmd="$pg_dump_cmd > $OUTPUT_FILE"
    
    echo "Database connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  SSL Mode: $DB_SSL_MODE"
    echo ""
    echo "Dump options:"
    echo "  Schema only: $SCHEMA_ONLY"
    echo "  Data only: $DATA_ONLY"
    echo "  No owner: $NO_OWNER"
    echo "  No privileges: $NO_PRIVILEGES"
    echo "  Clean (DROP statements): $([ "$DATA_ONLY" = false ] && echo "true" || echo "false")"
    echo "  If exists: $IF_EXISTS"
    echo "  CASCADE: $CASCADE"
    echo ""
    
    if [ "$CASCADE" = true ]; then
        echo "⚠️  Note: CASCADE will be applied to DROP statements to handle foreign key dependencies"
        echo "   This means dependent tables/constraints will also be dropped"
    fi
    
    echo "Executing: $pg_dump_cmd"
    eval $pg_dump_cmd
    
    if [ $? -eq 0 ]; then
        echo "✅ Database dump completed successfully!"
        echo "📁 Output file: $OUTPUT_FILE"
        echo "📊 File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
        
        # Show a preview of the dump file
        echo ""
        echo "📄 Dump file preview (first 15 lines):"
        head -15 "$OUTPUT_FILE"
        
        # Show DROP statements if they exist
        if [ "$DATA_ONLY" = false ]; then
            echo ""
            echo "🗑️  DROP statements found:"
            grep -i "DROP" "$OUTPUT_FILE" | head -5
            if [ $(grep -c -i "DROP" "$OUTPUT_FILE") -gt 5 ]; then
                echo "... and $(($(grep -c -i "DROP" "$OUTPUT_FILE") - 5)) more"
            fi
            
            # If CASCADE was used, show CASCADE statements
            if [ "$CASCADE" = true ]; then
                echo ""
                echo "🔄 CASCADE statements found:"
                grep -i "CASCADE" "$OUTPUT_FILE" | head -3
            fi
        fi
        
        # Post-process the file to add CASCADE if requested
        if [ "$CASCADE" = true ] && [ "$DATA_ONLY" = false ]; then
            echo ""
            echo "🔧 Adding CASCADE to DROP statements..."
            sed -i.bak 's/DROP TABLE IF EXISTS public\.\([^;]*\);/DROP TABLE IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
            sed -i.bak 's/DROP INDEX IF EXISTS public\.\([^;]*\);/DROP INDEX IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
            sed -i.bak 's/DROP SEQUENCE IF EXISTS public\.\([^;]*\);/DROP SEQUENCE IF EXISTS public.\1 CASCADE;/g' "$OUTPUT_FILE"
            sed -i.bak 's/DROP CONSTRAINT IF EXISTS \([^;]*\);/DROP CONSTRAINT IF EXISTS \1 CASCADE;/g' "$OUTPUT_FILE"
            rm -f "$OUTPUT_FILE.bak"
            echo "✅ CASCADE added to DROP statements"
        fi
    else
        echo "❌ Database dump failed!"
        exit 1
    fi
}

# Main execution
if [ "$LIST_TABLES" = true ]; then
    list_tables
elif [ "$SHOW_DEPS" = true ] && [ ${#TABLES[@]} -gt 0 ]; then
    for table in "${TABLES[@]}"; do
        show_dependencies "$table"
        echo ""
    done
elif [ "$ALL_TABLES" = true ] || [ ${#TABLES[@]} -gt 0 ]; then
    dump_tables
else
    echo "No tables specified. Use --all-tables or provide table names."
    exit 1
fi 