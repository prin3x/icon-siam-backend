import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_locales" ADD COLUMN "extraordinary_shopping_title" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "extraordinary_shopping_subtitle" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "extraordinary_shopping_title";
  ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "extraordinary_shopping_subtitle";`)
}
