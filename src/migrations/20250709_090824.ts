import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" ADD COLUMN "unique_id" varchar NULL;
  ALTER TABLE "dinings" ADD COLUMN "unique_id" varchar NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" DROP COLUMN "unique_id" CASCADE;
  ALTER TABLE "dinings" DROP COLUMN "unique_id" CASCADE;`)
}
