# Foreign Key Dependencies - Database Dump Solution

## 🚨 Problem: Foreign Key Dependencies

When dumping tables with foreign key relationships, you might encounter errors like:

```
ERROR: cannot drop table public.events because other objects depend on it
DETAIL: constraint news_press_rels_events_fk on table public.news_press_rels depends on table public.events
HINT: Use DROP ... CASCADE to drop the dependent objects too.
```

## 🔧 Solution: CASCADE Support

We've created a specialized script that handles foreign key dependencies automatically.

### Quick Fix

```bash
# Use the CASCADE script for tables with foreign key dependencies
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events
```

## 📊 Understanding Dependencies

### Check Table Dependencies

```bash
# See what depends on a table
./scripts/db-dump-with-cascade.sh --show-deps events
```

Example output for `events` table:

```
📋 Tables that depend on 'events' (foreign keys pointing to it):
        dependent_table        | dependent_column | referenced_table | referenced_column
-------------------------------+------------------+------------------+-------------------
 events_keywords               | _parent_id       | events           | id
 events_locales                | _parent_id       | events           | id
 events_rels                   | parent_id        | events           | id
 news_press_rels               | events_id        | events           | id
 page_banners                  | linked_event_id  | events           | id
 payload_locked_documents_rels | events_id        | events           | id
 promotions_rels               | events_id        | events           | id
 stories_rels                  | events_id        | events           | id
```

## 🛠️ Available Scripts for Different Scenarios

### 1. Simple Tables (No Foreign Keys)

```bash
./scripts/db-dump-with-drop.sh --if-exists --no-owner --no-privileges users
```

### 2. Complex Tables (With Foreign Keys) ⭐

```bash
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events
```

### 3. Check Dependencies First

```bash
# Always check dependencies before dumping complex tables
./scripts/db-dump-with-cascade.sh --show-deps events
./scripts/db-dump-with-cascade.sh --show-deps promotions
./scripts/db-dump-with-cascade.sh --show-deps users
```

## 🔍 What CASCADE Does

### Before (Without CASCADE)

```sql
DROP TABLE IF EXISTS public.events;
-- ❌ Fails if other tables reference events
```

### After (With CASCADE)

```sql
DROP TABLE IF EXISTS CASCADE public.events;
-- ✅ Drops events and all dependent constraints/tables
```

## 📋 Complete Workflow

### Step 1: Check Dependencies

```bash
./scripts/db-dump-with-cascade.sh --show-deps events
```

### Step 2: Dump with CASCADE

```bash
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events
```

### Step 3: Verify the Dump

```bash
# Check that CASCADE statements were added
grep -n "CASCADE" exports/dump_with_cascade_*.sql
```

### Step 4: Import to Target Database

```bash
psql -h target-db.example.com -U target_user -d target_db -f exports/dump_with_cascade_*.sql
```

## 🎯 Common Scenarios

### Scenario 1: Single Table with Dependencies

```bash
# Events table has 8 dependent tables
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events
```

### Scenario 2: Multiple Related Tables

```bash
# Dump events and all its related tables
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events events_keywords events_locales events_rels
```

### Scenario 3: All Tables (Complex Schema)

```bash
# Dump everything with CASCADE support
./scripts/db-dump-with-cascade.sh --all-tables --if-exists --cascade --no-owner --no-privileges
```

## ⚠️ Important Notes

### What CASCADE Does

- ✅ Drops the target table
- ✅ Drops all foreign key constraints that reference it
- ✅ Drops dependent tables if they only exist for this relationship
- ⚠️ **Be careful**: This can affect more tables than you expect

### Safety Recommendations

1. **Always check dependencies first**: `--show-deps`
2. **Test on a copy**: Import to a test database first
3. **Backup first**: Always backup before importing
4. **Review the dump**: Check what will be dropped

### When to Use Each Script

| Scenario             | Script                    | When to Use                             |
| -------------------- | ------------------------- | --------------------------------------- |
| Simple tables        | `db-dump-with-drop.sh`    | Tables without foreign key dependencies |
| Complex tables       | `db-dump-with-cascade.sh` | Tables with foreign key dependencies    |
| Unknown dependencies | `db-dump-with-cascade.sh` | When you're not sure about dependencies |

## 🔧 Troubleshooting

### Error: "cannot drop table because other objects depend on it"

**Solution**: Use the CASCADE script

```bash
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges table_name
```

### Error: "CASCADE not found"

**Solution**: Make sure you're using the CASCADE script

```bash
# Wrong script
./scripts/db-dump-with-drop.sh --cascade events

# Correct script
./scripts/db-dump-with-cascade.sh --cascade events
```

### Want to see what will be affected?

**Solution**: Check dependencies first

```bash
./scripts/db-dump-with-cascade.sh --show-deps table_name
```

## 📝 Example: Complete Events Dump

```bash
# 1. Check what depends on events
./scripts/db-dump-with-cascade.sh --show-deps events

# 2. Dump with CASCADE (handles all dependencies)
./scripts/db-dump-with-cascade.sh --if-exists --cascade --no-owner --no-privileges events

# 3. Verify the dump contains CASCADE statements
grep -n "CASCADE" exports/dump_with_cascade_*.sql

# 4. Import to target database
psql -h target-db.example.com -U target_user -d target_db -f exports/dump_with_cascade_*.sql
```

This solution ensures that your database dumps will work regardless of foreign key dependencies, making them safe to import into any PostgreSQL database!
