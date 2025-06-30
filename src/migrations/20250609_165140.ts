import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "events_slug_idx";
  DROP INDEX IF EXISTS "shops_slug_idx";
  DROP INDEX IF EXISTS "dinings_slug_idx";
  DROP INDEX IF EXISTS "attractions_slug_idx";
  DROP INDEX IF EXISTS "promotions_slug_idx";
  ALTER TABLE "events" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "shops" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "dinings" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "dinings_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "attractions" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "promotions" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "events" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "shops" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "dinings" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "attractions" ADD COLUMN "order" numeric;
  ALTER TABLE "attractions" ADD COLUMN "slug_lock" boolean DEFAULT true;
  ALTER TABLE "promotions" ADD COLUMN "slug_lock" boolean DEFAULT true;
  CREATE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "shops_slug_idx" ON "shops" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "dinings_slug_idx" ON "dinings" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "promotions_slug_idx" ON "promotions" USING btree ("slug");

  -- Update existing records with sequential order
  WITH numbered_rows AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at") as row_num
    FROM "attractions"
  )
  UPDATE "attractions" a
  SET "order" = nr.row_num
  FROM numbered_rows nr
  WHERE a.id = nr.id;

  -- Now make the column NOT NULL
  ALTER TABLE "attractions" ALTER COLUMN "order" SET NOT NULL;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "events_slug_idx";
  DROP INDEX IF EXISTS "shops_slug_idx";
  DROP INDEX IF EXISTS "dinings_slug_idx";
  DROP INDEX IF EXISTS "attractions_slug_idx";
  DROP INDEX IF EXISTS "promotions_slug_idx";
  ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "shops" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "dinings" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "dinings_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "attractions" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "promotions" ALTER COLUMN "slug" SET NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "shops_slug_idx" ON "shops" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "dinings_slug_idx" ON "dinings" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_slug_idx" ON "promotions" USING btree ("slug");
  ALTER TABLE "events" DROP COLUMN IF EXISTS "slug_lock";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "slug_lock";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "slug_lock";
  ALTER TABLE "attractions" DROP COLUMN IF EXISTS "order";
  ALTER TABLE "attractions" DROP COLUMN IF EXISTS "slug_lock";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "slug_lock";`)
}
