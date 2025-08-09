# Events & Promotions Database Dump

## 📋 Requested Tables

The following tables were successfully dumped with CASCADE support:

### Events Related Tables:

- `events` - Main events table
- `events_keywords` - Event keywords
- `events_locales` - Event localizations
- `events_rels` - Event relationships

### Promotions Related Tables:

- `promotions` - Main promotions table
- `promotions_keywords` - Promotion keywords
- `promotions_locales` - Promotion localizations
- `promotions_rels` - Promotion relationships

## 🔧 Dependencies Handled

### Events Dependencies:

- **8 dependent tables** reference the `events` table
- **1 dependency** - `events` depends on `floors` table

### Promotions Dependencies:

- **9 dependent tables** reference the `promotions` table
- **0 dependencies** - `promotions` has no foreign key dependencies

## ✅ Successful Dump

### File Created:

```
exports/dump_correct_cascade.sql
```

### File Size:

```
13M
```

### CASCADE Statements Added:

```sql
-- Correct PostgreSQL syntax
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP INDEX IF EXISTS public.events_updated_at_idx CASCADE;
DROP INDEX IF EXISTS public.promotions_slug_idx CASCADE;
```

## 🚀 Usage

### Import to Target Database:

```bash
psql -h target-db.example.com -U target_user -d target_db -f exports/dump_correct_cascade.sql
```

### What the Dump Contains:

- ✅ DROP statements with CASCADE (handles foreign key dependencies)
- ✅ CREATE statements for tables and indexes
- ✅ INSERT statements for all data
- ❌ No OWNER statements (works with different users)
- ❌ No GRANT/REVOKE statements (works with different permissions)

## 🔍 Verification

### Check CASCADE Statements:

```bash
grep -n "CASCADE" exports/dump_correct_cascade.sql
```

### Check DROP TABLE Statements:

```bash
grep -n "DROP TABLE.*CASCADE" exports/dump_correct_cascade.sql
```

## ⚠️ Important Notes

### What CASCADE Does:

- Drops the target table
- Drops all foreign key constraints that reference it
- Handles complex dependency chains automatically

### Safety:

- The dump will drop existing tables in the target database
- All dependent constraints will be removed
- Data will be recreated from the dump

### Recommended Import Process:

1. **Backup target database** (if it has important data)
2. **Test on a copy** first
3. **Import to production** when ready

## 📊 Dump Statistics

### Tables Included:

- 8 tables total
- 2 main tables (events, promotions)
- 6 related tables (keywords, locales, rels)

### Data Volume:

- 13MB dump file
- Contains all events and promotions data
- Includes all relationships and localizations

## 🔧 Troubleshooting

### If Import Fails:

1. Check target database permissions
2. Ensure PostgreSQL version compatibility
3. Verify network connectivity to target database

### If CASCADE Errors Occur:

- The dump should handle all dependencies automatically
- If errors persist, check for custom constraints not captured

## 📝 Command Used

```bash
./scripts/db-dump-with-cascade.sh \
  --if-exists \
  --cascade \
  --no-owner \
  --no-privileges \
  events \
  events_keywords \
  events_locales \
  events_rels \
  promotions \
  promotions_keywords \
  promotions_locales \
  promotions_rels \
  --output-file exports/dump_correct_cascade.sql
```

This dump is ready to import into any PostgreSQL database, regardless of user differences or foreign key dependencies!
