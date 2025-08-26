import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" ADD COLUMN "skip_sync" boolean DEFAULT false;
  ALTER TABLE "dinings" ADD COLUMN "skip_sync" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" DROP COLUMN "skip_sync";
  ALTER TABLE "dinings" DROP COLUMN "skip_sync";`)
}
