import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Prepare: add columns (nullable during backfill)
  await db.execute(sql`
   ALTER TABLE "getting_here_methods_locales" DISABLE ROW LEVEL SECURITY;
   ALTER TABLE "getting_here_methods" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
   ALTER TABLE "getting_here_methods" ADD COLUMN IF NOT EXISTS "type" "enum_getting_here_methods_type";
   ALTER TABLE "getting_here_methods" ADD COLUMN IF NOT EXISTS "title" varchar;
   ALTER TABLE "getting_here_methods" ADD COLUMN IF NOT EXISTS "details" jsonb;
  `)

  // 2) Backfill from locales table if present, prefer 'en' then fallback by priority en > th > zh
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.getting_here_methods_locales') IS NOT NULL THEN
      -- Prefer English values where available
      UPDATE "getting_here_methods" m
      SET "type" = l."type",
          "title" = l."title",
          "details" = l."details"
      FROM "getting_here_methods_locales" l
      WHERE m."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Set _locale to 'en' where an English row exists
      UPDATE "getting_here_methods" m
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "getting_here_methods_locales" l
        WHERE l."_parent_id" = m."id" AND l."_locale" = 'en'
      );

      -- Pick one locale per parent by priority en > th > zh, then any
      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale", l."type", l."title", l."details"
        FROM "getting_here_methods_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "getting_here_methods" m
      SET "_locale" = COALESCE(m."_locale", p."_locale"),
          "type" = COALESCE(m."type", p."type"),
          "title" = COALESCE(m."title", p."title"),
          "details" = COALESCE(m."details", p."details")
      FROM picked p
      WHERE m."id" = p."_parent_id";

      -- Final fallback for any remaining _locale
      UPDATE "getting_here_methods" m SET "_locale" = 'en' WHERE m."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Enforce NOT NULL constraints and create index
  await db.execute(sql`
   ALTER TABLE "getting_here_methods" ALTER COLUMN "_locale" SET NOT NULL;
   ALTER TABLE "getting_here_methods" ALTER COLUMN "type" SET NOT NULL;
   CREATE INDEX IF NOT EXISTS "getting_here_methods_locale_idx" ON "getting_here_methods" USING btree ("_locale");
  `)

  // 4) Drop the old locales table after successful migration
  await db.execute(sql`
   DROP TABLE IF EXISTS "getting_here_methods_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "getting_here_methods_locales" (
  	"type" "enum_getting_here_methods_type" NOT NULL,
  	"title" varchar,
  	"details" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX IF EXISTS "getting_here_methods_locale_idx";
  ALTER TABLE "getting_here_methods_locales" ADD CONSTRAINT "getting_here_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here_methods"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "getting_here_methods_locales_locale_parent_id_unique" ON "getting_here_methods_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "getting_here_methods" DROP COLUMN "_locale";
  ALTER TABLE "getting_here_methods" DROP COLUMN "type";
  ALTER TABLE "getting_here_methods" DROP COLUMN "title";
  ALTER TABLE "getting_here_methods" DROP COLUMN "details";`)
}
