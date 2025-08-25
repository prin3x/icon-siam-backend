import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Add new columns first (allow null during backfill)
  await db.execute(sql`
  ALTER TABLE "board_of_directors_directors" ALTER COLUMN "profile_image_id" DROP NOT NULL;
  ALTER TABLE "board_of_directors_directors" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "board_of_directors_directors" ADD COLUMN IF NOT EXISTS "full_name" varchar;
  ALTER TABLE "board_of_directors_directors" ADD COLUMN IF NOT EXISTS "title" varchar;

  ALTER TABLE "vision_mission_content_sections" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "vision_mission_content_sections" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "vision_mission_content_sections" ADD COLUMN IF NOT EXISTS "description" jsonb;
  `)

  // 2) Migrate data from locales tables if they exist
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.board_of_directors_directors_locales') IS NOT NULL THEN
      -- Prefer English values for full_name/title where available
      UPDATE "board_of_directors_directors" d
      SET "full_name" = l."full_name"
      FROM "board_of_directors_directors_locales" l
      WHERE d."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "board_of_directors_directors" d
      SET "title" = l."title"
      FROM "board_of_directors_directors_locales" l
      WHERE d."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "board_of_directors_directors" d
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "board_of_directors_directors_locales" l
        WHERE l."_parent_id" = d."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "board_of_directors_directors_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "board_of_directors_directors" d
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE d."id" = p."_parent_id" AND d."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "board_of_directors_directors" d SET "_locale" = 'en' WHERE d."_locale" IS NULL;
    END IF;

    IF to_regclass('public.vision_mission_content_sections_locales') IS NOT NULL THEN
      -- Prefer English values for title/description where available
      UPDATE "vision_mission_content_sections" c
      SET "title" = l."title"
      FROM "vision_mission_content_sections_locales" l
      WHERE c."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "vision_mission_content_sections" c
      SET "description" = l."description"
      FROM "vision_mission_content_sections_locales" l
      WHERE c."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "vision_mission_content_sections" c
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "vision_mission_content_sections_locales" l
        WHERE l."_parent_id" = c."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "vision_mission_content_sections_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "vision_mission_content_sections" c
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE c."id" = p."_parent_id" AND c."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "vision_mission_content_sections" c SET "_locale" = 'en' WHERE c."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Enforce NOT NULL for _locale and create indexes
  await db.execute(sql`
  ALTER TABLE "board_of_directors_directors" ALTER COLUMN "_locale" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "board_of_directors_directors_locale_idx" ON "board_of_directors_directors" USING btree ("_locale");

  ALTER TABLE "vision_mission_content_sections" ALTER COLUMN "_locale" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "vision_mission_content_sections_locale_idx" ON "vision_mission_content_sections" USING btree ("_locale");
  `)

  // 4) Drop the old locales tables
  await db.execute(sql`
  DROP TABLE IF EXISTS "board_of_directors_directors_locales" CASCADE;
  DROP TABLE IF EXISTS "vision_mission_content_sections_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "board_of_directors_directors_locales" (
  	"full_name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "vision_mission_content_sections_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "board_of_directors_directors_locale_idx";
  DROP INDEX "vision_mission_content_sections_locale_idx";
  ALTER TABLE "board_of_directors_directors" ALTER COLUMN "profile_image_id" SET NOT NULL;
  ALTER TABLE "board_of_directors_directors_locales" ADD CONSTRAINT "board_of_directors_directors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."board_of_directors_directors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vision_mission_content_sections_locales" ADD CONSTRAINT "vision_mission_content_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vision_mission_content_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "board_of_directors_directors_locales_locale_parent_id_unique" ON "board_of_directors_directors_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "vision_mission_content_sections_locales_locale_parent_id_unique" ON "vision_mission_content_sections_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "board_of_directors_directors" DROP COLUMN "_locale";
  ALTER TABLE "board_of_directors_directors" DROP COLUMN "full_name";
  ALTER TABLE "board_of_directors_directors" DROP COLUMN "title";
  ALTER TABLE "vision_mission_content_sections" DROP COLUMN "_locale";
  ALTER TABLE "vision_mission_content_sections" DROP COLUMN "title";
  ALTER TABLE "vision_mission_content_sections" DROP COLUMN "description";`)
}
