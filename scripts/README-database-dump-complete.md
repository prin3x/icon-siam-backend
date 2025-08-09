# Database Dump Tools - Complete Guide

This guide explains how to use the various database dump scripts to export data from PostgreSQL databases, with special focus on handling different database users and environments.

## 🚀 Quick Start

### 1. List available tables

```bash
./scripts/db-dump.sh --list-tables
```

### 2. Dump specific tables with DROP statements (recommended for cross-database imports)

```bash
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users events
```

### 3. Dump all tables

```bash
./scripts/db-dump-with-drop.sh --all-tables --if-exists --no-owner --no-privileges
```

## 📁 Available Scripts

### 1. `db-dump.sh` - Basic Dump Script

- **Purpose**: Simple database dumps
- **Best for**: Quick exports from the same database environment
- **Features**: Basic table selection, data/schema options

```bash
# Basic usage
./scripts/db-dump.sh users events

# Data only
./scripts/db-dump.sh --data-only users

# Schema only
./scripts/db-dump.sh --schema-only users
```

### 2. `db-dump-flexible.sh` - Flexible Configuration

- **Purpose**: Dumps with configurable database connections
- **Best for**: Different database environments
- **Features**: Command-line options, environment variables, owner/privilege control

```bash
# Use environment variables
DB_HOST=my-db.example.com DB_USER=myuser ./scripts/db-dump-flexible.sh users

# Use command line options
./scripts/db-dump-flexible.sh --host my-db.example.com --user myuser users

# Remove owner statements
./scripts/db-dump-flexible.sh --no-owner --no-privileges users
```

### 3. `db-dump-with-config.sh` - Configuration File Support

- **Purpose**: Dumps using configuration files
- **Best for**: Multiple database environments
- **Features**: Config files, environment separation

```bash
# Use default config
./scripts/db-dump-with-config.sh users

# Use specific config file
./scripts/db-dump-with-config.sh scripts/my-db-config.env users
```

### 4. `db-dump-with-drop.sh` - Cross-Database Imports ⭐

- **Purpose**: Dumps with DROP statements for clean imports
- **Best for**: Importing into different databases with different users
- **Features**: DROP statements, owner removal, privilege removal

```bash
# Recommended for cross-database imports
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users events

# All tables with DROP statements
./scripts/db-dump-with-drop.sh --all-tables --if-exists --no-owner --no-privileges
```

## 🔧 Handling Different Database Users

### Problem: OWNER statements in dumps

When you dump from one database and import to another, you might see errors like:

```sql
ALTER TABLE public.events OWNER TO "iconsiamWebDB";
```

This fails if the target database doesn't have the same user.

### Solution: Use `--no-owner` and `--no-privileges`

```bash
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users events
```

This creates a dump with:

- ✅ DROP statements to clean existing tables
- ✅ CREATE statements for tables and indexes
- ✅ INSERT statements for data
- ❌ No OWNER statements
- ❌ No GRANT/REVOKE statements

## 📋 Configuration Options

### Environment Variables

```bash
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASS=your_password
DB_SSL_MODE=require
```

### Configuration Files

Create `scripts/db-config.env`:

```bash
DB_HOST=my-database.example.com
DB_PORT=5432
DB_NAME=my_database
DB_USER=my_user
DB_PASS=my_password
DB_SSL_MODE=require
```

## 🎯 Common Use Cases

### 1. Development to Production

```bash
# Dump from development
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users events

# Import to production (using psql)
psql -h prod-db.example.com -U prod_user -d prod_db -f exports/dump_with_drop_20250804_145713.sql
```

### 2. Backup Specific Tables

```bash
# Backup user-related tables
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users user_sessions user_roles
```

### 3. Schema Migration

```bash
# Dump schema only
./scripts/db-dump-with-drop.sh --schema-only --if-exists --no-owner --no-privileges users events
```

### 4. Data Migration

```bash
# Dump data only (no DROP statements)
./scripts/db-dump-with-drop.sh --data-only users events
```

## 🔍 Understanding Dump Options

### DROP Statements (`--clean`)

- **What it does**: Adds `DROP TABLE IF EXISTS` before `CREATE TABLE`
- **When to use**: When importing to a database that might have existing tables
- **Example**: `DROP TABLE IF EXISTS public.users;`

### IF EXISTS (`--if-exists`)

- **What it does**: Makes DROP statements safer
- **When to use**: Always recommended with `--clean`
- **Example**: `DROP TABLE IF EXISTS public.users;` instead of `DROP TABLE public.users;`

### No Owner (`--no-owner`)

- **What it does**: Removes `ALTER TABLE ... OWNER TO` statements
- **When to use**: When target database has different users
- **Example**: Removes `ALTER TABLE public.users OWNER TO "iconsiamWebDB";`

### No Privileges (`--no-privileges`)

- **What it does**: Removes `GRANT` and `REVOKE` statements
- **When to use**: When target database has different permissions
- **Example**: Removes `GRANT SELECT ON TABLE public.users TO some_role;`

## 📊 Output Files

### File Naming

- **Basic dumps**: `exports/dump_YYYYMMDD_HHMMSS.sql`
- **Drops included**: `exports/dump_with_drop_YYYYMMDD_HHMMSS.sql`
- **Custom names**: Use `--output-file my_dump.sql`

### File Contents Preview

The scripts show:

- ✅ File size
- ✅ First 10-15 lines preview
- ✅ Number of DROP statements (when applicable)

## 🛠️ Troubleshooting

### Connection Issues

```bash
# Test connection
docker-compose run --rm db-dump psql -h your-host -U your-user -d your-db -c "\dt"
```

### Permission Issues

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Version Mismatch

- **Problem**: `pg_dump: error: aborting because of server version mismatch`
- **Solution**: Updated Docker image to PostgreSQL 17 (already done)

### SSL Issues

```bash
# For local databases without SSL
DB_SSL_MODE=disable ./scripts/db-dump-flexible.sh users
```

## 🔒 Security Notes

- Database credentials are in scripts for convenience
- Consider using environment variables for production
- Dumps contain sensitive data - handle with care
- Add `exports/` to `.gitignore` if not already there

## 📝 Examples

### Complete Workflow

```bash
# 1. List tables
./scripts/db-dump.sh --list-tables

# 2. Dump specific tables with DROP statements
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users events promotions

# 3. Check the dump file
head -20 exports/dump_with_drop_*.sql

# 4. Import to target database
psql -h target-db.example.com -U target_user -d target_db -f exports/dump_with_drop_*.sql
```

### Different Database Environment

```bash
# Create config for different database
cp scripts/db-config.example.env scripts/my-db-config.env
# Edit my-db-config.env with your database details

# Use the config
./scripts/db-dump-with-config.sh scripts/my-db-config.env users events
```

This setup gives you complete flexibility to dump data from any PostgreSQL database and import it into any other PostgreSQL database, regardless of user differences!
