import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_shops_status" ADD VALUE 'COMING_SOON';
  ALTER TYPE "public"."enum_dinings_status" ADD VALUE 'COMING_SOON';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_shops_status" CASCADE;
  CREATE TYPE "public"."enum_shops_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON');
  ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE "public"."enum_shops_status" USING status::text::"public"."enum_shops_status";
  ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
  ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_dinings_status" CASCADE;
  CREATE TYPE "public"."enum_dinings_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON');
  ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE "public"."enum_dinings_status" USING status::text::"public"."enum_dinings_status";
  ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';`)
}
