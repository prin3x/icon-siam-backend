#!/bin/bash

# Database dump script with configuration file support
# Usage: ./scripts/db-dump-with-config.sh [config-file] [options] [table1] [table2] ...

# Default config file
CONFIG_FILE="scripts/db-config.env"

# Function to show usage
show_usage() {
    echo "Usage: $0 [config-file] [options] [table1] [table2] ..."
    echo ""
    echo "Arguments:"
    echo "  config-file          Configuration file (default: $CONFIG_FILE)"
    echo ""
    echo "Options:"
    echo "  --all-tables         Dump all tables"
    echo "  --schema-only        Dump schema only (no data)"
    echo "  --data-only          Dump data only (no schema)"
    echo "  --list-tables        List all available tables"
    echo "  --no-owner           Remove OWNER statements from dump"
    echo "  --no-privileges      Remove GRANT/REVOKE statements from dump"
    echo "  --clean              Add DROP statements before CREATE"
    echo "  --if-exists          Use IF EXISTS with DROP statements"
    echo ""
    echo "Examples:"
    echo "  # Use default config file"
    echo "  $0 users events"
    echo ""
    echo "  # Use specific config file"
    echo "  $0 scripts/my-db-config.env users"
    echo ""
    echo "  # Dump without owner statements"
    echo "  $0 --no-owner --no-privileges users"
    echo ""
    echo "Configuration File Format:"
    echo "  DB_HOST=your-database-host"
    echo "  DB_PORT=5432"
    echo "  DB_NAME=your_database_name"
    echo "  DB_USER=your_username"
    echo "  DB_PASS=your_password"
    echo "  DB_SSL_MODE=require"
}

# Check if first argument is a config file
if [ $# -gt 0 ] && [[ "$1" != --* ]] && [ -f "$1" ]; then
    CONFIG_FILE="$1"
    shift
fi

# Load configuration file if it exists
if [ -f "$CONFIG_FILE" ]; then
    echo "📁 Loading configuration from: $CONFIG_FILE"
    source "$CONFIG_FILE"
else
    echo "⚠️  Configuration file not found: $CONFIG_FILE"
    echo "Using default values or environment variables"
fi

# Check if we have the required database connection details
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    echo "❌ Error: Missing required database connection details"
    echo "Please provide DB_HOST, DB_NAME, and DB_USER in the config file or environment"
    echo ""
    show_usage
    exit 1
fi

# Set defaults for optional parameters
DB_PORT="${DB_PORT:-5432}"
DB_SSL_MODE="${DB_SSL_MODE:-require}"

# Create exports directory if it doesn't exist
mkdir -p exports

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Check for special flags
SCHEMA_ONLY=false
DATA_ONLY=false
LIST_TABLES=false
ALL_TABLES=false
NO_OWNER=false
NO_PRIVILEGES=false
CLEAN=false
IF_EXISTS=false

TABLES=()

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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
        --clean)
            CLEAN=true
            shift
            ;;
        --if-exists)
            IF_EXISTS=true
            shift
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
    
    # Add owner/privilege options
    if [ "$NO_OWNER" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --no-owner"
    fi
    
    if [ "$NO_PRIVILEGES" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --no-privileges"
    fi
    
    # Add clean options
    if [ "$CLEAN" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --clean"
    fi
    
    if [ "$IF_EXISTS" = true ]; then
        pg_dump_cmd="$pg_dump_cmd --if-exists"
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
    
    echo "Database connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  SSL Mode: $DB_SSL_MODE"
    echo ""
    echo "Executing: $pg_dump_cmd"
    eval $pg_dump_cmd
    
    if [ $? -eq 0 ]; then
        echo "✅ Database dump completed successfully!"
        echo "📁 Output file: $output_file"
        echo "📊 File size: $(du -h "$output_file" | cut -f1)"
        
        # Show a preview of the dump file
        echo ""
        echo "📄 Dump file preview (first 10 lines):"
        head -10 "$output_file"
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