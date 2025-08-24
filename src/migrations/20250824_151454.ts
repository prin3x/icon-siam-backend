import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Add new columns first (make _locale nullable during backfill)
  await db.execute(sql`
  ALTER TABLE "homepage_iconic_experience" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "homepage_iconic_experience" ADD COLUMN IF NOT EXISTS "custom_title" varchar;
  ALTER TABLE "homepage_iconic_experience" ADD COLUMN IF NOT EXISTS "custom_link" varchar;
  ALTER TABLE "homepage_rels" ADD COLUMN IF NOT EXISTS "locale" "_locales";
  `)

  // 2) Migrate data from locales table if it exists
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.homepage_iconic_experience_locales') IS NOT NULL THEN
      -- Prefer English custom_title where available
      UPDATE "homepage_iconic_experience" h
      SET "custom_title" = l."custom_title"
      FROM "homepage_iconic_experience_locales" l
      WHERE h."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent
      -- First set 'en' where present
      UPDATE "homepage_iconic_experience" h
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "homepage_iconic_experience_locales" l
        WHERE l."_parent_id" = h."id" AND l."_locale" = 'en'
      );

      -- For remaining null locales, pick the first available locale per parent by priority en > th > zh
      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "homepage_iconic_experience_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "homepage_iconic_experience" h
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE h."id" = p."_parent_id" AND h."_locale" IS NULL;

      -- As a final fallback, set any remaining null locales to 'en'
      UPDATE "homepage_iconic_experience" h SET "_locale" = 'en' WHERE h."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Enforce NOT NULL after backfill
  await db.execute(sql`
  ALTER TABLE "homepage_iconic_experience" ALTER COLUMN "_locale" SET NOT NULL;
  `)

  // 4) Recreate indexes and drop obsolete structures
  await db.execute(sql`
  DROP INDEX IF EXISTS "homepage_rels_dinings_id_idx";
  DROP INDEX IF EXISTS "homepage_rels_shops_id_idx";
  DROP INDEX IF EXISTS "homepage_rels_attractions_id_idx";

  CREATE INDEX IF NOT EXISTS "homepage_iconic_experience_locale_idx" ON "homepage_iconic_experience" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "homepage_rels_locale_idx" ON "homepage_rels" USING btree ("locale");
  CREATE INDEX IF NOT EXISTS "homepage_rels_dinings_id_idx" ON "homepage_rels" USING btree ("dinings_id","locale");
  CREATE INDEX IF NOT EXISTS "homepage_rels_shops_id_idx" ON "homepage_rels" USING btree ("shops_id","locale");
  CREATE INDEX IF NOT EXISTS "homepage_rels_attractions_id_idx" ON "homepage_rels" USING btree ("attractions_id","locale");
  `)

  // 5) Finally, drop the old locales table if present
  await db.execute(sql`DROP TABLE IF EXISTS "homepage_iconic_experience_locales" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_iconic_experience_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "homepage_iconic_experience_locale_idx";
  DROP INDEX "homepage_rels_locale_idx";
  DROP INDEX "homepage_rels_dinings_id_idx";
  DROP INDEX "homepage_rels_shops_id_idx";
  DROP INDEX "homepage_rels_attractions_id_idx";
  ALTER TABLE "homepage_iconic_experience_locales" ADD CONSTRAINT "homepage_iconic_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_iconic_experience"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "homepage_iconic_experience_locales_locale_parent_id_unique" ON "homepage_iconic_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_rels_dinings_id_idx" ON "homepage_rels" USING btree ("dinings_id");
  CREATE INDEX "homepage_rels_shops_id_idx" ON "homepage_rels" USING btree ("shops_id");
  CREATE INDEX "homepage_rels_attractions_id_idx" ON "homepage_rels" USING btree ("attractions_id");
  ALTER TABLE "homepage_iconic_experience" DROP COLUMN "_locale";
  ALTER TABLE "homepage_iconic_experience" DROP COLUMN "custom_title";
  ALTER TABLE "homepage_iconic_experience" DROP COLUMN "custom_link";
  ALTER TABLE "homepage_rels" DROP COLUMN "locale";`)
}
