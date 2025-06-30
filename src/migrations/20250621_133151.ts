import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_images_cover_photo_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_images_facebook_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "events_images_images_cover_photo_idx";
  DROP INDEX IF EXISTS "events_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "events_images_images_facebook_image_idx";
  ALTER TABLE "events_locales" ADD COLUMN "images_cover_photo_id" integer;
  ALTER TABLE "events_locales" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "events_locales" ADD COLUMN "images_facebook_image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_images_images_cover_photo_idx" ON "events_locales" USING btree ("images_cover_photo_id","_locale");
  CREATE INDEX IF NOT EXISTS "events_images_images_thumbnail_idx" ON "events_locales" USING btree ("images_thumbnail_id","_locale");
  CREATE INDEX IF NOT EXISTS "events_images_images_facebook_image_idx" ON "events_locales" USING btree ("images_facebook_image_id","_locale");
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_cover_photo_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_facebook_image_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_locales" DROP CONSTRAINT "events_locales_images_cover_photo_id_media_id_fk";
  
  ALTER TABLE "events_locales" DROP CONSTRAINT "events_locales_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "events_locales" DROP CONSTRAINT "events_locales_images_facebook_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "events_images_images_cover_photo_idx";
  DROP INDEX IF EXISTS "events_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "events_images_images_facebook_image_idx";
  ALTER TABLE "events" ADD COLUMN "images_cover_photo_id" integer;
  ALTER TABLE "events" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "events" ADD COLUMN "images_facebook_image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_images_images_cover_photo_idx" ON "events" USING btree ("images_cover_photo_id");
  CREATE INDEX IF NOT EXISTS "events_images_images_thumbnail_idx" ON "events" USING btree ("images_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "events_images_images_facebook_image_idx" ON "events" USING btree ("images_facebook_image_id");
  ALTER TABLE "events_locales" DROP COLUMN IF EXISTS "images_cover_photo_id";
  ALTER TABLE "events_locales" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "events_locales" DROP COLUMN IF EXISTS "images_facebook_image_id";`)
}
