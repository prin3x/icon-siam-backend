import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Drop obsolete indexes if they exist (safe no-ops if missing)
  await db.execute(sql`
  DROP INDEX IF EXISTS "about_iconsiam_banner_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_development_partners_development_partners_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx";
  DROP INDEX IF EXISTS "board_of_directors_banner_image_idx";
  DROP INDEX IF EXISTS "vision_mission_banner_image_idx";
  `)

  // 2) Add new columns (nullable first for safe backfill)
  await db.execute(sql`
  ALTER TABLE "about_iconsiam_development_partners_partners" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "description" varchar;
  
  ALTER TABLE "iconsiam_awards_awards_by_year" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "iconsiam_awards_awards_by_year" ADD COLUMN IF NOT EXISTS "content" jsonb;
  
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "about_iconsiam_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "development_partners_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "board_of_directors_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "vision_mission_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "vision_mission_background_color" varchar DEFAULT '#2B2B28';
  `)

  // 3) Backfill data from old locale tables and base columns where possible
  await db.execute(sql`
  DO $$
  BEGIN
    -- Backfill awards_list localized fields and _locale
    IF to_regclass('public.about_iconsiam_awards_awards_list_locales') IS NOT NULL THEN
      -- Prefer English where available
      UPDATE "about_iconsiam_awards_awards_list" t
      SET "title" = l."title"
      FROM "about_iconsiam_awards_awards_list_locales" l
      WHERE t."id" = l."_parent_id" AND l."_locale" = 'en' AND t."title" IS NULL;

      UPDATE "about_iconsiam_awards_awards_list" t
      SET "description" = l."description"
      FROM "about_iconsiam_awards_awards_list_locales" l
      WHERE t."id" = l."_parent_id" AND l."_locale" = 'en' AND t."description" IS NULL;

      -- Backfill _locale preferring en > th > zh per parent
      UPDATE "about_iconsiam_awards_awards_list" t
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "about_iconsiam_awards_awards_list_locales" l
        WHERE l."_parent_id" = t."id" AND l."_locale" = 'en'
      ) AND t."_locale" IS NULL;

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "about_iconsiam_awards_awards_list_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "about_iconsiam_awards_awards_list" t
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE t."id" = p."_parent_id" AND t."_locale" IS NULL;

      -- Final fallback locale
      UPDATE "about_iconsiam_awards_awards_list" t SET "_locale" = 'en' WHERE t."_locale" IS NULL;
    END IF;

    -- Backfill awards_by_year localized fields and _locale
    IF to_regclass('public.iconsiam_awards_awards_by_year_locales') IS NOT NULL THEN
      UPDATE "iconsiam_awards_awards_by_year" t
      SET "content" = l."content"
      FROM "iconsiam_awards_awards_by_year_locales" l
      WHERE t."id" = l."_parent_id" AND l."_locale" = 'en' AND t."content" IS NULL;

      UPDATE "iconsiam_awards_awards_by_year" t
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "iconsiam_awards_awards_by_year_locales" l
        WHERE l."_parent_id" = t."id" AND l."_locale" = 'en'
      ) AND t."_locale" IS NULL;

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "iconsiam_awards_awards_by_year_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "iconsiam_awards_awards_by_year" t
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE t."id" = p."_parent_id" AND t."_locale" IS NULL;

      UPDATE "iconsiam_awards_awards_by_year" t SET "_locale" = 'en' WHERE t."_locale" IS NULL;
    END IF;

    -- Backfill image columns and background color from base table into locales
    IF to_regclass('public.about_iconsiam') IS NOT NULL THEN
      UPDATE "about_iconsiam_locales" l
      SET "about_iconsiam_image_id" = a."about_iconsiam_image_id",
          "development_partners_image_id" = a."development_partners_image_id",
          "board_of_directors_image_id" = a."board_of_directors_image_id",
          "vision_mission_image_id" = a."vision_mission_image_id",
          "vision_mission_background_color" = COALESCE(a."vision_mission_background_color", l."vision_mission_background_color")
      FROM "about_iconsiam" a
      WHERE l."_parent_id" = a."id";
    END IF;

    -- Set default locale for development partners array items when unknown
    UPDATE "about_iconsiam_development_partners_partners" p
    SET "_locale" = 'en'
    WHERE p."_locale" IS NULL;
  END $$;
  `)

  // 4) Enforce NOT NULL for _locale columns and create indexes
  await db.execute(sql`
  ALTER TABLE "about_iconsiam_awards_awards_list" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "iconsiam_awards_awards_by_year" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "about_iconsiam_development_partners_partners" ALTER COLUMN "_locale" SET NOT NULL;

  CREATE INDEX IF NOT EXISTS "about_iconsiam_development_partners_partners_locale_idx" ON "about_iconsiam_development_partners_partners" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_awards_awards_list_locale_idx" ON "about_iconsiam_awards_awards_list" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "iconsiam_awards_awards_by_year_locale_idx" ON "iconsiam_awards_awards_by_year" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx" ON "about_iconsiam_locales" USING btree ("about_iconsiam_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_development_partners_development_partners_image_idx" ON "about_iconsiam_locales" USING btree ("development_partners_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx" ON "about_iconsiam_locales" USING btree ("board_of_directors_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx" ON "about_iconsiam_locales" USING btree ("vision_mission_image_id");
  `)

  // 5) Add new foreign keys on locales image columns
  await db.execute(sql`
  ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_about_iconsiam_image_id_media_id_fk" FOREIGN KEY ("about_iconsiam_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_development_partners_image_id_media_id_fk" FOREIGN KEY ("development_partners_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_board_of_directors_image_id_media_id_fk" FOREIGN KEY ("board_of_directors_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_vision_mission_image_id_media_id_fk" FOREIGN KEY ("vision_mission_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  `)

  // 6) Drop old foreign keys and columns now that data is moved
  await db.execute(sql`
  -- Drop old FKs
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_banner_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam" DROP CONSTRAINT "about_iconsiam_banner_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_about_iconsiam_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam" DROP CONSTRAINT "about_iconsiam_about_iconsiam_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_development_partners_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam" DROP CONSTRAINT "about_iconsiam_development_partners_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_board_of_directors_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam" DROP CONSTRAINT "about_iconsiam_board_of_directors_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_vision_mission_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam" DROP CONSTRAINT "about_iconsiam_vision_mission_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'board_of_directors_banner_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "board_of_directors" DROP CONSTRAINT "board_of_directors_banner_image_id_media_id_fk";
    END IF;
  END $$;

  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'vision_mission_banner_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "vision_mission" DROP CONSTRAINT "vision_mission_banner_image_id_media_id_fk";
    END IF;
  END $$;

  -- Drop old columns
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "banner_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "about_iconsiam_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "development_partners_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "board_of_directors_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "vision_mission_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "vision_mission_background_color";
  ALTER TABLE "board_of_directors" DROP COLUMN IF EXISTS "banner_image_id";
  ALTER TABLE "vision_mission" DROP COLUMN IF EXISTS "banner_image_id";
  `)

  // 7) Finally, drop old locale tables after backfill
  await db.execute(sql`
  DROP TABLE IF EXISTS "about_iconsiam_awards_awards_list_locales" CASCADE;
  DROP TABLE IF EXISTS "iconsiam_awards_awards_by_year_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "about_iconsiam_awards_awards_list_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards_awards_by_year_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_about_iconsiam_image_id_media_id_fk";
  
  ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_development_partners_image_id_media_id_fk";
  
  ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_board_of_directors_image_id_media_id_fk";
  
  ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_vision_mission_image_id_media_id_fk";
  
  DROP INDEX "about_iconsiam_development_partners_partners_locale_idx";
  DROP INDEX "about_iconsiam_awards_awards_list_locale_idx";
  DROP INDEX "about_iconsiam_about_iconsiam_about_iconsiam_image_idx";
  DROP INDEX "about_iconsiam_development_partners_development_partners_image_idx";
  DROP INDEX "about_iconsiam_board_of_directors_board_of_directors_image_idx";
  DROP INDEX "about_iconsiam_vision_mission_vision_mission_image_idx";
  DROP INDEX "iconsiam_awards_awards_by_year_locale_idx";
  ALTER TABLE "about_iconsiam" ADD COLUMN "banner_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN "about_iconsiam_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN "development_partners_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN "board_of_directors_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN "vision_mission_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN "vision_mission_background_color" varchar DEFAULT '#2B2B28';
  ALTER TABLE "board_of_directors" ADD COLUMN "banner_image_id" integer;
  ALTER TABLE "vision_mission" ADD COLUMN "banner_image_id" integer;
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ADD CONSTRAINT "about_iconsiam_awards_awards_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam_awards_awards_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_awards_by_year_locales" ADD CONSTRAINT "iconsiam_awards_awards_by_year_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards_awards_by_year"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "about_iconsiam_awards_awards_list_locales_locale_parent_id_unique" ON "about_iconsiam_awards_awards_list_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "iconsiam_awards_awards_by_year_locales_locale_parent_id_unique" ON "iconsiam_awards_awards_by_year_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_about_iconsiam_image_id_media_id_fk" FOREIGN KEY ("about_iconsiam_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_development_partners_image_id_media_id_fk" FOREIGN KEY ("development_partners_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_board_of_directors_image_id_media_id_fk" FOREIGN KEY ("board_of_directors_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_vision_mission_image_id_media_id_fk" FOREIGN KEY ("vision_mission_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "board_of_directors" ADD CONSTRAINT "board_of_directors_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vision_mission" ADD CONSTRAINT "vision_mission_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_iconsiam_banner_image_idx" ON "about_iconsiam" USING btree ("banner_image_id");
  CREATE INDEX "about_iconsiam_about_iconsiam_about_iconsiam_image_idx" ON "about_iconsiam" USING btree ("about_iconsiam_image_id");
  CREATE INDEX "about_iconsiam_development_partners_development_partners_image_idx" ON "about_iconsiam" USING btree ("development_partners_image_id");
  CREATE INDEX "about_iconsiam_board_of_directors_board_of_directors_image_idx" ON "about_iconsiam" USING btree ("board_of_directors_image_id");
  CREATE INDEX "about_iconsiam_vision_mission_vision_mission_image_idx" ON "about_iconsiam" USING btree ("vision_mission_image_id");
  CREATE INDEX "board_of_directors_banner_image_idx" ON "board_of_directors" USING btree ("banner_image_id");
  CREATE INDEX "vision_mission_banner_image_idx" ON "vision_mission" USING btree ("banner_image_id");
  ALTER TABLE "about_iconsiam_development_partners_partners" DROP COLUMN "_locale";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN "_locale";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN "title";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN "description";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN "about_iconsiam_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN "development_partners_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN "board_of_directors_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN "vision_mission_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN "vision_mission_background_color";
  ALTER TABLE "iconsiam_awards_awards_by_year" DROP COLUMN "_locale";
  ALTER TABLE "iconsiam_awards_awards_by_year" DROP COLUMN "content";`)
}
