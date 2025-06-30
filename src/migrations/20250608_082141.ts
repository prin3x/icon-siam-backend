import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "events_slug_idx";
  DROP INDEX IF EXISTS "shops_slug_idx";
  DROP INDEX IF EXISTS "dinings_slug_idx";
  DROP INDEX IF EXISTS "attractions_slug_idx";
  DROP INDEX IF EXISTS "icon_craft_slug_idx";
  DROP INDEX IF EXISTS "icon_luxe_slug_idx";
  DROP INDEX IF EXISTS "categories_slug_idx";
  DROP INDEX IF EXISTS "promotions_slug_idx";

  -- First add nullable columns
  ALTER TABLE "events" ADD COLUMN "slug" varchar;
  ALTER TABLE "shops" ADD COLUMN "slug" varchar;
  ALTER TABLE "dinings" ADD COLUMN "slug" varchar;
  ALTER TABLE "attractions" ADD COLUMN "slug" varchar;
  ALTER TABLE "icon_craft" ADD COLUMN "slug" varchar;
  ALTER TABLE "icon_luxe" ADD COLUMN "slug" varchar;
  ALTER TABLE "categories" ADD COLUMN "slug" varchar;
  ALTER TABLE "promotions" ADD COLUMN "slug" varchar;

  -- Generate random slugs for each table
  UPDATE "events" SET "slug" = 'event-' || substr(md5(random()::text), 1, 8);
  UPDATE "shops" SET "slug" = 'shop-' || substr(md5(random()::text), 1, 8);
  UPDATE "dinings" SET "slug" = 'dining-' || substr(md5(random()::text), 1, 8);
  UPDATE "attractions" SET "slug" = 'attraction-' || substr(md5(random()::text), 1, 8);
  UPDATE "icon_craft" SET "slug" = 'craft-' || substr(md5(random()::text), 1, 8);
  UPDATE "icon_luxe" SET "slug" = 'luxe-' || substr(md5(random()::text), 1, 8);
  UPDATE "categories" SET "slug" = 'category-' || substr(md5(random()::text), 1, 8);
  UPDATE "promotions" SET "slug" = 'promo-' || substr(md5(random()::text), 1, 8);

  -- Now make the columns NOT NULL
  ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "shops" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "dinings" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "attractions" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "icon_craft" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "icon_luxe" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "promotions" ALTER COLUMN "slug" SET NOT NULL;

  CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "shops_slug_idx" ON "shops" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "dinings_slug_idx" ON "dinings" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_craft_slug_idx" ON "icon_craft" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_luxe_slug_idx" ON "icon_luxe" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_slug_idx" ON "promotions" USING btree ("slug");
  ALTER TABLE "events_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "shops_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "dinings_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "attractions_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "icon_craft_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "icon_luxe_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "categories_locales" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "promotions_locales" DROP COLUMN IF EXISTS "slug";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "events_slug_idx";
  DROP INDEX IF EXISTS "shops_slug_idx";
  DROP INDEX IF EXISTS "dinings_slug_idx";
  DROP INDEX IF EXISTS "attractions_slug_idx";
  DROP INDEX IF EXISTS "icon_craft_slug_idx";
  DROP INDEX IF EXISTS "icon_luxe_slug_idx";
  DROP INDEX IF EXISTS "categories_slug_idx";
  DROP INDEX IF EXISTS "promotions_slug_idx";
  ALTER TABLE "events_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "shops_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "dinings_locales" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "attractions_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "icon_craft_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "icon_luxe_locales" ADD COLUMN "slug" varchar;
  ALTER TABLE "categories_locales" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "promotions_locales" ADD COLUMN "slug" varchar;
  CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "shops_slug_idx" ON "shops_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "dinings_slug_idx" ON "dinings_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_craft_slug_idx" ON "icon_craft_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_luxe_slug_idx" ON "icon_luxe_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_slug_idx" ON "promotions_locales" USING btree ("slug","_locale");
  ALTER TABLE "events" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "attractions" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "icon_craft" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "icon_luxe" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "slug";`)
}
