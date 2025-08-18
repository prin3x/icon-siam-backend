import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" ADD COLUMN "iconluxe_custom_link_url" varchar;
  ALTER TABLE "dinings" ADD COLUMN "iconluxe_custom_link_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" DROP COLUMN "iconluxe_custom_link_url";
  ALTER TABLE "dinings" DROP COLUMN "iconluxe_custom_link_url";`)
}
