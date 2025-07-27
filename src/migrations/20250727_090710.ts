import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Convert categories type to text temporarily
    ALTER TABLE "public"."categories" ALTER COLUMN "type" SET DATA TYPE text;

    -- Drop and recreate the enum with the new values
    DROP TYPE "public"."enum_categories_type" CASCADE;
    CREATE TYPE "public"."enum_categories_type" AS ENUM('shops', 'dinings', 'promotions', 'events', 'directory', 'news_press', 'stories');
    
    -- Convert back to the new enum
    ALTER TABLE "public"."categories" ALTER COLUMN "type" SET DATA TYPE "public"."enum_categories_type" USING "type"::text::"public"."enum_categories_type";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Convert categories type to text temporarily
    ALTER TABLE "public"."categories" ALTER COLUMN "type" SET DATA TYPE text;

    -- Drop and recreate the enum without the new values
    DROP TYPE "public"."enum_categories_type" CASCADE;
    CREATE TYPE "public"."enum_categories_type" AS ENUM('shops', 'dinings', 'promotions', 'events', 'directory');

    -- Convert back to the old enum
    ALTER TABLE "public"."categories" ALTER COLUMN "type" SET DATA TYPE "public"."enum_categories_type" USING "type"::text::"public"."enum_categories_type";
  `)
}
