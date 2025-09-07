import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Prepare: ensure columns exist on main table (nullable during backfill)
  await db.execute(sql`
   ALTER TABLE "icon_craft_content_locales" DISABLE ROW LEVEL SECURITY;
   ALTER TABLE "icon_craft_content" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
   ALTER TABLE "icon_craft_content" ADD COLUMN IF NOT EXISTS "title" varchar;
   ALTER TABLE "icon_craft_content" ADD COLUMN IF NOT EXISTS "description" varchar;
  `)

  // 2) Backfill data from locales table if it exists
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.icon_craft_content_locales') IS NOT NULL THEN
      -- Prefer English values where available
      UPDATE "icon_craft_content" m
      SET "title" = l."title"
      FROM "icon_craft_content_locales" l
      WHERE m."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "icon_craft_content" m
      SET "description" = l."description"
      FROM "icon_craft_content_locales" l
      WHERE m."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "icon_craft_content" m
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "icon_craft_content_locales" l
        WHERE l."_parent_id" = m."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "icon_craft_content_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "icon_craft_content" m
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE m."id" = p."_parent_id" AND m."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "icon_craft_content" m SET "_locale" = 'en' WHERE m."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Enforce NOT NULL and create index
  await db.execute(sql`
   ALTER TABLE "icon_craft_content" ALTER COLUMN "_locale" SET NOT NULL;
   CREATE INDEX IF NOT EXISTS "icon_craft_content_locale_idx" ON "icon_craft_content" USING btree ("_locale");
  `)

  // 4) Drop the old locales table after successful migration
  await db.execute(sql`
   DROP TABLE IF EXISTS "icon_craft_content_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "icon_craft_content_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "icon_craft_content_locale_idx";
  ALTER TABLE "icon_craft_content_locales" ADD CONSTRAINT "icon_craft_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft_content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "icon_craft_content_locales_locale_parent_id_unique" ON "icon_craft_content_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "icon_craft_content" DROP COLUMN "_locale";
  ALTER TABLE "icon_craft_content" DROP COLUMN "title";
  ALTER TABLE "icon_craft_content" DROP COLUMN "description";`)
}
