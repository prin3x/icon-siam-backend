import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Add new columns first (allow null during backfill)
  await db.execute(sql`
  ALTER TABLE "homepage_extraordinary_shopping" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "homepage_extraordinary_shopping" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "homepage_extraordinary_shopping" ADD COLUMN IF NOT EXISTS "subtitle" varchar;
  `)

  // 2) Migrate data from locales table if it exists
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.homepage_extraordinary_shopping_locales') IS NOT NULL THEN
      -- Prefer English values for title/subtitle where available
      UPDATE "homepage_extraordinary_shopping" h
      SET "title" = l."title"
      FROM "homepage_extraordinary_shopping_locales" l
      WHERE h."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "homepage_extraordinary_shopping" h
      SET "subtitle" = l."subtitle"
      FROM "homepage_extraordinary_shopping_locales" l
      WHERE h."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "homepage_extraordinary_shopping" h
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "homepage_extraordinary_shopping_locales" l
        WHERE l."_parent_id" = h."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "homepage_extraordinary_shopping_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "homepage_extraordinary_shopping" h
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE h."id" = p."_parent_id" AND h."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "homepage_extraordinary_shopping" h SET "_locale" = 'en' WHERE h."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Enforce NOT NULL after backfill
  await db.execute(sql`
  ALTER TABLE "homepage_extraordinary_shopping" ALTER COLUMN "_locale" SET NOT NULL;
  `)

  // 4) Create index and drop the old locales table
  await db.execute(sql`
  CREATE INDEX IF NOT EXISTS "homepage_extraordinary_shopping_locale_idx" ON "homepage_extraordinary_shopping" USING btree ("_locale");
  DROP TABLE IF EXISTS "homepage_extraordinary_shopping_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_extraordinary_shopping_locales" (
    "title" varchar,
    "subtitle" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "homepage_extraordinary_shopping_locale_idx";
  ALTER TABLE "homepage_extraordinary_shopping_locales" ADD CONSTRAINT "homepage_extraordinary_shopping_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_extraordinary_shopping"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "homepage_extraordinary_shopping_locales_locale_parent_id_unique" ON "homepage_extraordinary_shopping_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "homepage_extraordinary_shopping" DROP COLUMN "_locale";
  ALTER TABLE "homepage_extraordinary_shopping" DROP COLUMN "title";
  ALTER TABLE "homepage_extraordinary_shopping" DROP COLUMN "subtitle";`)
}
