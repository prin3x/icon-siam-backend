import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_stickbar_status" AS ENUM('active', 'inactive');
  CREATE TABLE IF NOT EXISTS "stickbar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon_id" integer,
  	"link" varchar,
  	"status" "enum_stickbar_status" DEFAULT 'active',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "homepage" ADD COLUMN "onesiam_animation_text_runner" varchar;
  ALTER TABLE "homepage" ADD COLUMN "onesiam_animation_text_runner_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stickbar_id" integer;
  DO $$ BEGIN
   ALTER TABLE "stickbar" ADD CONSTRAINT "stickbar_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "stickbar_icon_idx" ON "stickbar" USING btree ("icon_id");
  CREATE INDEX IF NOT EXISTS "stickbar_updated_at_idx" ON "stickbar" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "stickbar_created_at_idx" ON "stickbar" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stickbar_fk" FOREIGN KEY ("stickbar_id") REFERENCES "public"."stickbar"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_stickbar_id_idx" ON "payload_locked_documents_rels" USING btree ("stickbar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stickbar" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "stickbar" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stickbar_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_stickbar_id_idx";
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "onesiam_animation_text_runner";
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "onesiam_animation_text_runner_color";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "stickbar_id";
  DROP TYPE "public"."enum_stickbar_status";`)
}
