import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "getting_here" ADD COLUMN "google_map_url" varchar;
  ALTER TABLE "getting_here_locales" ADD COLUMN "google_map_title" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "getting_here" DROP COLUMN "google_map_url";
  ALTER TABLE "getting_here_locales" DROP COLUMN "google_map_title";`)
}
