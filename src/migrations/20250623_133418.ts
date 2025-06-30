import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "stickbar_locales" (
  	"title" varchar,
  	"icon_id" integer,
  	"link" varchar,
  	"status" "enum_stickbar_status" DEFAULT 'active',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "stickbar" DROP CONSTRAINT "stickbar_icon_id_media_id_fk";
  
  DROP INDEX IF EXISTS "stickbar_icon_idx";
  DO $$ BEGIN
   ALTER TABLE "stickbar_locales" ADD CONSTRAINT "stickbar_locales_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "stickbar_locales" ADD CONSTRAINT "stickbar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stickbar"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "stickbar_icon_idx" ON "stickbar_locales" USING btree ("icon_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "stickbar_locales_locale_parent_id_unique" ON "stickbar_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "stickbar" DROP COLUMN IF EXISTS "title";
  ALTER TABLE "stickbar" DROP COLUMN IF EXISTS "icon_id";
  ALTER TABLE "stickbar" DROP COLUMN IF EXISTS "link";
  ALTER TABLE "stickbar" DROP COLUMN IF EXISTS "status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stickbar_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "stickbar_locales" CASCADE;
  ALTER TABLE "stickbar" ADD COLUMN "title" varchar;
  ALTER TABLE "stickbar" ADD COLUMN "icon_id" integer;
  ALTER TABLE "stickbar" ADD COLUMN "link" varchar;
  ALTER TABLE "stickbar" ADD COLUMN "status" "enum_stickbar_status" DEFAULT 'active';
  DO $$ BEGIN
   ALTER TABLE "stickbar" ADD CONSTRAINT "stickbar_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "stickbar_icon_idx" ON "stickbar" USING btree ("icon_id");`)
}
