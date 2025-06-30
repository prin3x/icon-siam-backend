import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_page_banners_status" AS ENUM('ACTIVE', 'INACTIVE');
  ALTER TABLE "page_banners" ADD COLUMN "status" "enum_page_banners_status" DEFAULT 'ACTIVE';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_banners" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_page_banners_status";`)
}
