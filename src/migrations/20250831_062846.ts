import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN
     IF to_regclass('public.about_iconsiam_awards_awards_list_locales') IS NOT NULL THEN
       ALTER TABLE "about_iconsiam_awards_awards_list_locales" DISABLE ROW LEVEL SECURITY;
       DROP TABLE IF EXISTS "about_iconsiam_awards_awards_list_locales" CASCADE;
     END IF;
   END $$;
  DO $$ BEGIN
     IF to_regclass('public.iconsiam_awards_awards_by_year_locales') IS NOT NULL THEN
       ALTER TABLE "iconsiam_awards_awards_by_year_locales" DISABLE ROW LEVEL SECURITY;
       DROP TABLE IF EXISTS "iconsiam_awards_awards_by_year_locales" CASCADE;
     END IF;
   END $$;
  
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
  
  DROP INDEX IF EXISTS "about_iconsiam_banner_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_development_partners_development_partners_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx";
  DROP INDEX IF EXISTS "board_of_directors_banner_image_idx";
  DROP INDEX IF EXISTS "vision_mission_banner_image_idx";
  
  -- Add columns with defaults to avoid NOT NULL violations
  ALTER TABLE "about_iconsiam_development_partners_partners" ADD COLUMN IF NOT EXISTS "_locale" "_locales" DEFAULT 'en'::"_locales";
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "_locale" "_locales" DEFAULT 'en'::"_locales";
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "about_iconsiam_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "development_partners_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "board_of_directors_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "vision_mission_image_id" integer;
  ALTER TABLE "about_iconsiam_locales" ADD COLUMN IF NOT EXISTS "vision_mission_background_color" varchar DEFAULT '#2B2B28';
  ALTER TABLE "iconsiam_awards_awards_by_year" ADD COLUMN IF NOT EXISTS "_locale" "_locales" DEFAULT 'en'::"_locales";
  ALTER TABLE "iconsiam_awards_awards_by_year" ADD COLUMN IF NOT EXISTS "content" jsonb;
  
  -- Add FKs on locales table if missing
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_about_iconsiam_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_about_iconsiam_image_id_media_id_fk" FOREIGN KEY ("about_iconsiam_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_development_partners_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_development_partners_image_id_media_id_fk" FOREIGN KEY ("development_partners_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_board_of_directors_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_board_of_directors_image_id_media_id_fk" FOREIGN KEY ("board_of_directors_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_vision_mission_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_vision_mission_image_id_media_id_fk" FOREIGN KEY ("vision_mission_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  
  -- Indexes
  CREATE INDEX IF NOT EXISTS "about_iconsiam_development_partners_partners_locale_idx" ON "about_iconsiam_development_partners_partners" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_awards_awards_list_locale_idx" ON "about_iconsiam_awards_awards_list" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx" ON "about_iconsiam_locales" USING btree ("about_iconsiam_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_development_partners_development_partners_image_idx" ON "about_iconsiam_locales" USING btree ("development_partners_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx" ON "about_iconsiam_locales" USING btree ("board_of_directors_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx" ON "about_iconsiam_locales" USING btree ("vision_mission_image_id");
  CREATE INDEX IF NOT EXISTS "iconsiam_awards_awards_by_year_locale_idx" ON "iconsiam_awards_awards_by_year" USING btree ("_locale");
  
  -- Now enforce NOT NULL on newly added locale columns
  ALTER TABLE "about_iconsiam_development_partners_partners" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "about_iconsiam_awards_awards_list" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "iconsiam_awards_awards_by_year" ALTER COLUMN "_locale" SET NOT NULL;
  
  -- Finally drop old columns if they still exist
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "banner_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "about_iconsiam_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "development_partners_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "board_of_directors_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "vision_mission_image_id";
  ALTER TABLE "about_iconsiam" DROP COLUMN IF EXISTS "vision_mission_background_color";
  ALTER TABLE "board_of_directors" DROP COLUMN IF EXISTS "banner_image_id";
  ALTER TABLE "vision_mission" DROP COLUMN IF EXISTS "banner_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "about_iconsiam_awards_awards_list_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "iconsiam_awards_awards_by_year_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_about_iconsiam_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_about_iconsiam_image_id_media_id_fk";
    END IF;
  END $$;
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_development_partners_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_development_partners_image_id_media_id_fk";
    END IF;
  END $$;
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_board_of_directors_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_board_of_directors_image_id_media_id_fk";
    END IF;
  END $$;
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'about_iconsiam_locales_vision_mission_image_id_media_id_fk'
    ) THEN
      ALTER TABLE "about_iconsiam_locales" DROP CONSTRAINT "about_iconsiam_locales_vision_mission_image_id_media_id_fk";
    END IF;
  END $$;
  
  DROP INDEX IF EXISTS "about_iconsiam_development_partners_partners_locale_idx";
  DROP INDEX IF EXISTS "about_iconsiam_awards_awards_list_locale_idx";
  DROP INDEX IF EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_development_partners_development_partners_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx";
  DROP INDEX IF EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx";
  DROP INDEX IF EXISTS "iconsiam_awards_awards_by_year_locale_idx";
  
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "banner_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "about_iconsiam_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "development_partners_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "board_of_directors_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "vision_mission_image_id" integer;
  ALTER TABLE "about_iconsiam" ADD COLUMN IF NOT EXISTS "vision_mission_background_color" varchar DEFAULT '#2B2B28';
  ALTER TABLE "board_of_directors" ADD COLUMN IF NOT EXISTS "banner_image_id" integer;
  ALTER TABLE "vision_mission" ADD COLUMN IF NOT EXISTS "banner_image_id" integer;
  
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ADD CONSTRAINT "about_iconsiam_awards_awards_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam_awards_awards_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_awards_by_year_locales" ADD CONSTRAINT "iconsiam_awards_awards_by_year_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards_awards_by_year"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX IF NOT EXISTS "about_iconsiam_awards_awards_list_locales_locale_parent_id_unique" ON "about_iconsiam_awards_awards_list_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "iconsiam_awards_awards_by_year_locales_locale_parent_id_unique" ON "iconsiam_awards_awards_by_year_locales" USING btree ("_locale","_parent_id");
  
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_about_iconsiam_image_id_media_id_fk" FOREIGN KEY ("about_iconsiam_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_development_partners_image_id_media_id_fk" FOREIGN KEY ("development_partners_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_board_of_directors_image_id_media_id_fk" FOREIGN KEY ("board_of_directors_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_vision_mission_image_id_media_id_fk" FOREIGN KEY ("vision_mission_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  
  CREATE INDEX IF NOT EXISTS "about_iconsiam_banner_image_idx" ON "about_iconsiam" USING btree ("banner_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_about_iconsiam_about_iconsiam_image_idx" ON "about_iconsiam" USING btree ("about_iconsiam_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_development_partners_development_partners_image_idx" ON "about_iconsiam" USING btree ("development_partners_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_board_of_directors_board_of_directors_image_idx" ON "about_iconsiam" USING btree ("board_of_directors_image_id");
  CREATE INDEX IF NOT EXISTS "about_iconsiam_vision_mission_vision_mission_image_idx" ON "about_iconsiam" USING btree ("vision_mission_image_id");
  CREATE INDEX IF NOT EXISTS "board_of_directors_banner_image_idx" ON "board_of_directors" USING btree ("banner_image_id");
  CREATE INDEX IF NOT EXISTS "vision_mission_banner_image_idx" ON "vision_mission" USING btree ("banner_image_id");
  
  ALTER TABLE "about_iconsiam_development_partners_partners" DROP COLUMN IF EXISTS "_locale";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN IF EXISTS "_locale";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "about_iconsiam_awards_awards_list" DROP COLUMN IF EXISTS "description";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN IF EXISTS "about_iconsiam_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN IF EXISTS "development_partners_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN IF EXISTS "board_of_directors_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN IF EXISTS "vision_mission_image_id";
  ALTER TABLE "about_iconsiam_locales" DROP COLUMN IF EXISTS "vision_mission_background_color";
  ALTER TABLE "iconsiam_awards_awards_by_year" DROP COLUMN IF EXISTS "_locale";
  ALTER TABLE "iconsiam_awards_awards_by_year" DROP COLUMN IF EXISTS "content";`)
}
