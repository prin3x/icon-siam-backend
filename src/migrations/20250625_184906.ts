import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_floors_status" AS ENUM('ACTIVE', 'INACTIVE');
  ALTER TABLE "floors" ADD COLUMN "status" "enum_floors_status" DEFAULT 'ACTIVE' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "floors" DROP COLUMN IF EXISTS "status";
  DROP TYPE "public"."enum_floors_status";`)
}
