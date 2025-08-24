import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "homepage_extraordinary_shopping" ALTER COLUMN "cover_image_id" DROP NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping" ALTER COLUMN "path_to_page" DROP NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping_locales" ALTER COLUMN "subtitle" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "homepage_extraordinary_shopping" ALTER COLUMN "cover_image_id" SET NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping" ALTER COLUMN "path_to_page" SET NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "homepage_extraordinary_shopping_locales" ALTER COLUMN "subtitle" SET NOT NULL;`)
}
