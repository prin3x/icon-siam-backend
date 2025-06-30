import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "getting_here_methods_locales" (
  	"type" "enum_getting_here_methods_type" NOT NULL,
  	"title" varchar,
  	"details" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "getting_here_locales" (
  	"title" varchar DEFAULT 'Getting Here',
  	"location" varchar,
  	"contact" varchar,
  	"contact_info" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "getting_here_methods_locales" ADD CONSTRAINT "getting_here_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here_methods"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "getting_here_locales" ADD CONSTRAINT "getting_here_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "getting_here_methods_locales_locale_parent_id_unique" ON "getting_here_methods_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "getting_here_locales_locale_parent_id_unique" ON "getting_here_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "getting_here_methods" DROP COLUMN IF EXISTS "type";
  ALTER TABLE "getting_here_methods" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "getting_here_methods" DROP COLUMN IF EXISTS "details";
  ALTER TABLE "getting_here" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "getting_here" DROP COLUMN IF EXISTS "location";
  ALTER TABLE "getting_here" DROP COLUMN IF EXISTS "contact";
  ALTER TABLE "getting_here" DROP COLUMN IF EXISTS "contact_info";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "getting_here_methods_locales" CASCADE;
  DROP TABLE "getting_here_locales" CASCADE;
  ALTER TABLE "getting_here_methods" ADD COLUMN "type" "enum_getting_here_methods_type" NOT NULL;
  ALTER TABLE "getting_here_methods" ADD COLUMN "title" varchar;
  ALTER TABLE "getting_here_methods" ADD COLUMN "details" jsonb;
  ALTER TABLE "getting_here" ADD COLUMN "title" varchar DEFAULT 'Getting Here';
  ALTER TABLE "getting_here" ADD COLUMN "location" varchar;
  ALTER TABLE "getting_here" ADD COLUMN "contact" varchar;
  ALTER TABLE "getting_here" ADD COLUMN "contact_info" varchar;`)
}
