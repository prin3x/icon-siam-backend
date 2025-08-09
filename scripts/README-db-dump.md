# Database Dump Tool

This tool allows you to dump data from the ICONSIAM PostgreSQL database using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Access to the ICONSIAM database

## Database Connection Details

- **Host**: icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com
- **Port**: 5432
- **Database**: iconsiam_web_dev
- **User**: iconsiamWebDB
- **SSL**: Required

## Usage

### 1. List all available tables
```bash
./scripts/db-dump.sh --list-tables
```

### 2. Dump specific tables
```bash
# Dump single table
./scripts/db-dump.sh users

# Dump multiple tables
./scripts/db-dump.sh users events promotions

# Dump with data only (no schema)
./scripts/db-dump.sh --data-only users events

# Dump with schema only (no data)
./scripts/db-dump.sh --schema-only users events
```

### 3. Dump all tables
```bash
./scripts/db-dump.sh --all-tables
```

### 4. Direct Docker commands
```bash
# Dump specific tables
docker-compose run --rm db-dump pg_dump \
  -h icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com \
  -p 5432 \
  -U iconsiamWebDB \
  -d iconsiam_web_dev \
  --table=users \
  --table=events \
  --data-only > exports/dump.sql

# List tables
docker-compose run --rm db-dump psql \
  -h icon-siam-db.cygygwebj53j.ap-southeast-1.rds.amazonaws.com \
  -p 5432 \
  -U iconsiamWebDB \
  -d iconsiam_web_dev \
  -c "\dt"
```

## Output

- Dumps are saved to the `exports/` directory
- Files are named with timestamp: `dump_YYYYMMDD_HHMMSS.sql`
- The script shows file size and success/failure status

## Options

- `--all-tables`: Dump all tables in the database
- `--schema-only`: Dump only the schema (CREATE statements, no data)
- `--data-only`: Dump only the data (INSERT statements, no schema)
- `--list-tables`: List all available tables in the database

## Examples

```bash
# Get a list of all tables first
./scripts/db-dump.sh --list-tables

# Dump user-related tables
./scripts/db-dump.sh users user_sessions user_roles

# Dump event data only
./scripts/db-dump.sh --data-only events event_categories

# Dump all tables with schema only
./scripts/db-dump.sh --all-tables --schema-only
```

## Troubleshooting

1. **Connection issues**: Ensure the database is accessible and credentials are correct
2. **Permission issues**: Make sure the script is executable (`chmod +x scripts/db-dump.sh`)
3. **Docker issues**: Ensure Docker is running and the service is available
4. **SSL issues**: The database requires SSL connection (already configured in the script)

## Security Notes

- Database credentials are hardcoded in the script for convenience
- Consider using environment variables for production use
- Dumps contain sensitive data - handle with care
- The `exports/` directory should be added to `.gitignore` if not already 