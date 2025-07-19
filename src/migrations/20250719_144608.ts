import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   -- Convert shops status to text temporarily
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE text;
   
   -- Drop and recreate the enum with the new value
   DROP TYPE "public"."enum_shops_status" CASCADE;
   CREATE TYPE "public"."enum_shops_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON', 'MASTER');
   
   -- Convert back to the new enum
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE "public"."enum_shops_status" USING status::text::"public"."enum_shops_status";
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
   
   -- Convert dinings status to text temporarily
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE text;
   
   -- Drop and recreate the enum with the new value
   DROP TYPE "public"."enum_dinings_status" CASCADE;
   CREATE TYPE "public"."enum_dinings_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON', 'MASTER');
   
   -- Convert back to the new enum
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE "public"."enum_dinings_status" USING status::text::"public"."enum_dinings_status";
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   -- Convert shops status to text temporarily
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE text;
   
   -- Drop and recreate the enum without MASTER
   DROP TYPE "public"."enum_shops_status" CASCADE;
   CREATE TYPE "public"."enum_shops_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON');
   
   -- Convert back to the enum without MASTER
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DATA TYPE "public"."enum_shops_status" USING status::text::"public"."enum_shops_status";
   ALTER TABLE "public"."shops" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
   
   -- Convert dinings status to text temporarily
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE text;
   
   -- Drop and recreate the enum without MASTER
   DROP TYPE "public"."enum_dinings_status" CASCADE;
   CREATE TYPE "public"."enum_dinings_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED', 'COMING_SOON');
   
   -- Convert back to the enum without MASTER
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DATA TYPE "public"."enum_dinings_status" USING status::text::"public"."enum_dinings_status";
   ALTER TABLE "public"."dinings" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';`)
}
