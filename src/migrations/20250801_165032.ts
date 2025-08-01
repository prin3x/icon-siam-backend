import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "promotions_locales" ALTER COLUMN "title" DROP NOT NULL;
 `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "promotions_locales" ALTER COLUMN "title" SET NOT NULL;
`)
}
