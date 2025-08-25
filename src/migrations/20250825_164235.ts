import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1) Add new columns first (allow null during backfill)
  await db.execute(sql`
  DROP INDEX IF EXISTS "facilities_rels_shops_id_idx";
  DROP INDEX IF EXISTS "facilities_rels_floors_id_idx";

  ALTER TABLE "facilities_services" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "facilities_services" ADD COLUMN IF NOT EXISTS "service_name" varchar;
  ALTER TABLE "facilities_services" ADD COLUMN IF NOT EXISTS "description" varchar;

  ALTER TABLE "facilities_facilities" ADD COLUMN IF NOT EXISTS "_locale" "_locales";
  ALTER TABLE "facilities_facilities" ADD COLUMN IF NOT EXISTS "facility_name" varchar;
  ALTER TABLE "facilities_facilities" ADD COLUMN IF NOT EXISTS "description" varchar;

  ALTER TABLE "facilities_rels" ADD COLUMN IF NOT EXISTS "locale" "_locales";
  `)

  // 2) Migrate data from locales tables if they exist
  await db.execute(sql`
  DO $$
  BEGIN
    IF to_regclass('public.facilities_services_locales') IS NOT NULL THEN
      -- Prefer English values for service_name/description where available
      UPDATE "facilities_services" s
      SET "service_name" = l."service_name"
      FROM "facilities_services_locales" l
      WHERE s."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "facilities_services" s
      SET "description" = l."description"
      FROM "facilities_services_locales" l
      WHERE s."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "facilities_services" s
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "facilities_services_locales" l
        WHERE l."_parent_id" = s."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "facilities_services_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "facilities_services" s
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE s."id" = p."_parent_id" AND s."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "facilities_services" s SET "_locale" = 'en' WHERE s."_locale" IS NULL;
    END IF;

    IF to_regclass('public.facilities_facilities_locales') IS NOT NULL THEN
      -- Prefer English values for facility_name/description where available
      UPDATE "facilities_facilities" f
      SET "facility_name" = l."facility_name"
      FROM "facilities_facilities_locales" l
      WHERE f."id" = l."_parent_id" AND l."_locale" = 'en';

      UPDATE "facilities_facilities" f
      SET "description" = l."description"
      FROM "facilities_facilities_locales" l
      WHERE f."id" = l."_parent_id" AND l."_locale" = 'en';

      -- Backfill _locale preferring 'en', then any available locale per parent by priority en > th > zh
      UPDATE "facilities_facilities" f
      SET "_locale" = 'en'
      WHERE EXISTS (
        SELECT 1 FROM "facilities_facilities_locales" l
        WHERE l."_parent_id" = f."id" AND l."_locale" = 'en'
      );

      WITH picked AS (
        SELECT DISTINCT ON (l."_parent_id") l."_parent_id", l."_locale"
        FROM "facilities_facilities_locales" l
        ORDER BY l."_parent_id",
          CASE l."_locale" WHEN 'en' THEN 0 WHEN 'th' THEN 1 WHEN 'zh' THEN 2 ELSE 3 END
      )
      UPDATE "facilities_facilities" f
      SET "_locale" = p."_locale"
      FROM picked p
      WHERE f."id" = p."_parent_id" AND f."_locale" IS NULL;

      -- Final fallback for any remaining
      UPDATE "facilities_facilities" f SET "_locale" = 'en' WHERE f."_locale" IS NULL;
    END IF;
  END $$;
  `)

  // 3) Backfill rel locales from array item locales for array relationship paths
  await db.execute(sql`
  UPDATE "facilities_rels" r
  SET "locale" = s."_locale"
  FROM "facilities_services" s
  WHERE r."parent_id" = s."_parent_id"
    AND substring(r."path" from '^services\\.([^.]+)\\.floor$') = s."id"
    AND r."locale" IS NULL;

  UPDATE "facilities_rels" r
  SET "locale" = f."_locale"
  FROM "facilities_facilities" f
  WHERE r."parent_id" = f."_parent_id"
    AND substring(r."path" from '^facilities\\.([^.]+)\\.floor$') = f."id"
    AND r."locale" IS NULL;
  `)

  // 4) Enforce NOT NULL for _locale and create indexes
  await db.execute(sql`
  ALTER TABLE "facilities_services" ALTER COLUMN "_locale" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "facilities_services_locale_idx" ON "facilities_services" USING btree ("_locale");

  ALTER TABLE "facilities_facilities" ALTER COLUMN "_locale" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "facilities_facilities_locale_idx" ON "facilities_facilities" USING btree ("_locale");

  CREATE INDEX IF NOT EXISTS "facilities_rels_locale_idx" ON "facilities_rels" USING btree ("locale");
  CREATE INDEX IF NOT EXISTS "facilities_rels_shops_id_idx" ON "facilities_rels" USING btree ("shops_id","locale");
  CREATE INDEX IF NOT EXISTS "facilities_rels_floors_id_idx" ON "facilities_rels" USING btree ("floors_id","locale");
  `)

  // 5) Drop the old locales tables
  await db.execute(sql`
  DROP TABLE IF EXISTS "facilities_services_locales" CASCADE;
  DROP TABLE IF EXISTS "facilities_facilities_locales" CASCADE;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "facilities_services_locales" (
  	"service_name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "facilities_facilities_locales" (
  	"facility_name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "facilities_services_locale_idx";
  DROP INDEX "facilities_facilities_locale_idx";
  DROP INDEX "facilities_rels_locale_idx";
  DROP INDEX "facilities_rels_shops_id_idx";
  DROP INDEX "facilities_rels_floors_id_idx";
  ALTER TABLE "facilities_services_locales" ADD CONSTRAINT "facilities_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_facilities_locales" ADD CONSTRAINT "facilities_facilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities_facilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "facilities_services_locales_locale_parent_id_unique" ON "facilities_services_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "facilities_facilities_locales_locale_parent_id_unique" ON "facilities_facilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "facilities_rels_shops_id_idx" ON "facilities_rels" USING btree ("shops_id");
  CREATE INDEX "facilities_rels_floors_id_idx" ON "facilities_rels" USING btree ("floors_id");
  ALTER TABLE "facilities_services" DROP COLUMN "_locale";
  ALTER TABLE "facilities_services" DROP COLUMN "service_name";
  ALTER TABLE "facilities_services" DROP COLUMN "description";
  ALTER TABLE "facilities_facilities" DROP COLUMN "_locale";
  ALTER TABLE "facilities_facilities" DROP COLUMN "facility_name";
  ALTER TABLE "facilities_facilities" DROP COLUMN "description";
  ALTER TABLE "facilities_rels" DROP COLUMN "locale";`)
}
