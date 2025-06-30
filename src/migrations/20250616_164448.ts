import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "homepage" ADD COLUMN "onesiam_app_background_image_mobile_id" integer;
  DO $$ BEGIN
   ALTER TABLE "homepage" ADD CONSTRAINT "homepage_onesiam_app_background_image_mobile_id_media_id_fk" FOREIGN KEY ("onesiam_app_background_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_onesiam_app_background_image_mobile_idx" ON "homepage" USING btree ("onesiam_app_background_image_mobile_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "homepage" DROP CONSTRAINT "homepage_onesiam_app_background_image_mobile_id_media_id_fk";
  
  DROP INDEX IF EXISTS "homepage_onesiam_app_background_image_mobile_idx";
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "onesiam_app_background_image_mobile_id";
`)
}
