import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_promotion_type" AS ENUM('none', 'special_offer', 'discount', 'event', 'sale');
  CREATE TABLE IF NOT EXISTS "shops_images_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "shops_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_images_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  ALTER TABLE "shops_gallery_image_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dinings_gallery_image_urls" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shops_gallery_image_urls" CASCADE;
  DROP TABLE "dinings_gallery_image_urls" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT "events_image_url_id_media_id_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_logo_image_url_id_media_id_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_main_image_url_id_media_id_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_logo_image_url_id_media_id_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_main_image_url_id_media_id_fk";
  
  ALTER TABLE "promotions" DROP CONSTRAINT "promotions_main_image_url_id_media_id_fk";
  
  DROP INDEX IF EXISTS "events_image_url_idx";
  DROP INDEX IF EXISTS "shops_logo_image_url_idx";
  DROP INDEX IF EXISTS "shops_main_image_url_idx";
  DROP INDEX IF EXISTS "dinings_logo_image_url_idx";
  DROP INDEX IF EXISTS "dinings_main_image_url_idx";
  DROP INDEX IF EXISTS "promotions_main_image_url_idx";
  ALTER TABLE "events" ALTER COLUMN "is_featured" SET DEFAULT false;
  ALTER TABLE "events_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "promotions_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "events" ADD COLUMN "highlight" varchar;
  ALTER TABLE "events" ADD COLUMN "section_highlight" varchar;
  ALTER TABLE "events" ADD COLUMN "short_alphabet" varchar;
  ALTER TABLE "events" ADD COLUMN "show_time" varchar;
  ALTER TABLE "events" ADD COLUMN "sort_order" numeric;
  ALTER TABLE "events" ADD COLUMN "images_cover_photo_id" integer;
  ALTER TABLE "events" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "events" ADD COLUMN "images_facebook_image_id" integer;
  ALTER TABLE "events" ADD COLUMN "location_floor_id" integer;
  ALTER TABLE "events" ADD COLUMN "location_zone" varchar;
  ALTER TABLE "events" ADD COLUMN "promotion_type" "enum_events_promotion_type";
  ALTER TABLE "events" ADD COLUMN "system_original_id" numeric;
  ALTER TABLE "events" ADD COLUMN "system_cid" numeric;
  ALTER TABLE "events" ADD COLUMN "system_scid" numeric;
  ALTER TABLE "events" ADD COLUMN "system_create_by" varchar;
  ALTER TABLE "events" ADD COLUMN "system_modified_at" timestamp(3) with time zone;
  ALTER TABLE "events_locales" ADD COLUMN "meta_keywords" varchar;
  ALTER TABLE "events_rels" ADD COLUMN "dinings_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "shops_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "attractions_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "shops" ADD COLUMN "location_coordinates_poi_x" numeric DEFAULT 0;
  ALTER TABLE "shops" ADD COLUMN "location_coordinates_poi_y" numeric DEFAULT 0;
  ALTER TABLE "shops" ADD COLUMN "contact_info_website" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_phone" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_instagram_url" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_facebook_url" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_wechat_account" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_line_account" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_info_weibo_url" varchar;
  ALTER TABLE "shops" ADD COLUMN "images_logo_id" integer;
  ALTER TABLE "shops" ADD COLUMN "images_main_image_id" integer;
  ALTER TABLE "shops" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "shops" ADD COLUMN "images_facebook_image_id" integer;
  ALTER TABLE "shops" ADD COLUMN "date_range_start_date" timestamp(3) with time zone;
  ALTER TABLE "shops" ADD COLUMN "date_range_end_date" timestamp(3) with time zone;
  ALTER TABLE "shops" ADD COLUMN "short_alphabet" varchar;
  ALTER TABLE "shops" ADD COLUMN "sort_order" numeric;
  ALTER TABLE "shops_rels" ADD COLUMN "dinings_id" integer;
  ALTER TABLE "shops_rels" ADD COLUMN "shops_id" integer;
  ALTER TABLE "shops_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "location_coordinates_poi_x" numeric DEFAULT 0;
  ALTER TABLE "dinings" ADD COLUMN "location_coordinates_poi_y" numeric DEFAULT 0;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_website" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_phone" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_instagram_url" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_facebook_url" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_wechat_account" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_line_account" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_info_weibo_url" varchar;
  ALTER TABLE "dinings" ADD COLUMN "images_logo_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "images_main_image_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "images_facebook_image_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "date_range_start_date" timestamp(3) with time zone;
  ALTER TABLE "dinings" ADD COLUMN "date_range_end_date" timestamp(3) with time zone;
  ALTER TABLE "dinings" ADD COLUMN "short_alphabet" varchar;
  ALTER TABLE "dinings" ADD COLUMN "sort_order" numeric;
  ALTER TABLE "dinings_rels" ADD COLUMN "dinings_id" integer;
  ALTER TABLE "dinings_rels" ADD COLUMN "shops_id" integer;
  ALTER TABLE "dinings_rels" ADD COLUMN "promotions_id" integer;
  ALTER TABLE "categories" ADD COLUMN "original_id" varchar;
  ALTER TABLE "promotions" ADD COLUMN "highlight" varchar;
  ALTER TABLE "promotions" ADD COLUMN "section_highlight" varchar;
  ALTER TABLE "promotions" ADD COLUMN "short_alphabet" varchar;
  ALTER TABLE "promotions" ADD COLUMN "show_time" varchar;
  ALTER TABLE "promotions" ADD COLUMN "pin_to_home" boolean DEFAULT false;
  ALTER TABLE "promotions" ADD COLUMN "pin_to_section" boolean DEFAULT false;
  ALTER TABLE "promotions" ADD COLUMN "sort_order" numeric;
  ALTER TABLE "promotions" ADD COLUMN "images_cover_photo_id" integer;
  ALTER TABLE "promotions" ADD COLUMN "images_thumbnail_id" integer;
  ALTER TABLE "promotions" ADD COLUMN "images_facebook_image_id" integer;
  ALTER TABLE "promotions" ADD COLUMN "promotion_type" varchar;
  ALTER TABLE "promotions" ADD COLUMN "system_original_id" numeric;
  ALTER TABLE "promotions" ADD COLUMN "system_cid" varchar;
  ALTER TABLE "promotions" ADD COLUMN "system_scid" varchar;
  ALTER TABLE "promotions" ADD COLUMN "system_create_by" varchar;
  ALTER TABLE "promotions" ADD COLUMN "system_modified_at" timestamp(3) with time zone;
  ALTER TABLE "promotions_locales" ADD COLUMN "meta_keywords" varchar;
  ALTER TABLE "promotions_rels" ADD COLUMN "dinings_id" integer;
  ALTER TABLE "promotions_rels" ADD COLUMN "shops_id" integer;
  ALTER TABLE "promotions_rels" ADD COLUMN "attractions_id" integer;
  ALTER TABLE "promotions_rels" ADD COLUMN "events_id" integer;
  DO $$ BEGIN
   ALTER TABLE "shops_images_gallery" ADD CONSTRAINT "shops_images_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_images_gallery" ADD CONSTRAINT "shops_images_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_tags" ADD CONSTRAINT "shops_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_images_gallery" ADD CONSTRAINT "dinings_images_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_images_gallery" ADD CONSTRAINT "dinings_images_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_tags" ADD CONSTRAINT "dinings_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "shops_images_gallery_order_idx" ON "shops_images_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_images_gallery_parent_id_idx" ON "shops_images_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_images_gallery_image_idx" ON "shops_images_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "shops_tags_order_idx" ON "shops_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_tags_parent_id_idx" ON "shops_tags" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_gallery_order_idx" ON "dinings_images_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_images_gallery_parent_id_idx" ON "dinings_images_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_gallery_image_idx" ON "dinings_images_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "dinings_tags_order_idx" ON "dinings_tags" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_tags_parent_id_idx" ON "dinings_tags" USING btree ("_parent_id");
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
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_location_floor_id_floors_id_fk" FOREIGN KEY ("location_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_images_logo_id_media_id_fk" FOREIGN KEY ("images_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_images_main_image_id_media_id_fk" FOREIGN KEY ("images_main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_rels" ADD CONSTRAINT "shops_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_rels" ADD CONSTRAINT "shops_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_rels" ADD CONSTRAINT "shops_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_images_logo_id_media_id_fk" FOREIGN KEY ("images_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_images_main_image_id_media_id_fk" FOREIGN KEY ("images_main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_rels" ADD CONSTRAINT "dinings_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_rels" ADD CONSTRAINT "dinings_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_rels" ADD CONSTRAINT "dinings_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_images_images_cover_photo_idx" ON "events" USING btree ("images_cover_photo_id");
  CREATE INDEX IF NOT EXISTS "events_images_images_thumbnail_idx" ON "events" USING btree ("images_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "events_images_images_facebook_image_idx" ON "events" USING btree ("images_facebook_image_id");
  CREATE INDEX IF NOT EXISTS "events_location_location_floor_idx" ON "events" USING btree ("location_floor_id");
  CREATE INDEX IF NOT EXISTS "events_rels_dinings_id_idx" ON "events_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "events_rels_shops_id_idx" ON "events_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "events_rels_attractions_id_idx" ON "events_rels" USING btree ("attractions_id");
  CREATE INDEX IF NOT EXISTS "events_rels_promotions_id_idx" ON "events_rels" USING btree ("promotions_id");
  CREATE INDEX IF NOT EXISTS "shops_images_images_logo_idx" ON "shops" USING btree ("images_logo_id");
  CREATE INDEX IF NOT EXISTS "shops_images_images_main_image_idx" ON "shops" USING btree ("images_main_image_id");
  CREATE INDEX IF NOT EXISTS "shops_images_images_thumbnail_idx" ON "shops" USING btree ("images_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "shops_images_images_facebook_image_idx" ON "shops" USING btree ("images_facebook_image_id");
  CREATE INDEX IF NOT EXISTS "shops_rels_dinings_id_idx" ON "shops_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "shops_rels_shops_id_idx" ON "shops_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "shops_rels_promotions_id_idx" ON "shops_rels" USING btree ("promotions_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_images_logo_idx" ON "dinings" USING btree ("images_logo_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_images_main_image_idx" ON "dinings" USING btree ("images_main_image_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_images_thumbnail_idx" ON "dinings" USING btree ("images_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "dinings_images_images_facebook_image_idx" ON "dinings" USING btree ("images_facebook_image_id");
  CREATE INDEX IF NOT EXISTS "dinings_rels_dinings_id_idx" ON "dinings_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "dinings_rels_shops_id_idx" ON "dinings_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "dinings_rels_promotions_id_idx" ON "dinings_rels" USING btree ("promotions_id");
  CREATE INDEX IF NOT EXISTS "categories_original_id_idx" ON "categories" USING btree ("original_id");
  CREATE INDEX IF NOT EXISTS "promotions_images_images_cover_photo_idx" ON "promotions" USING btree ("images_cover_photo_id");
  CREATE INDEX IF NOT EXISTS "promotions_images_images_thumbnail_idx" ON "promotions" USING btree ("images_thumbnail_id");
  CREATE INDEX IF NOT EXISTS "promotions_images_images_facebook_image_idx" ON "promotions" USING btree ("images_facebook_image_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_dinings_id_idx" ON "promotions_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_shops_id_idx" ON "promotions_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_attractions_id_idx" ON "promotions_rels" USING btree ("attractions_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_events_id_idx" ON "promotions_rels" USING btree ("events_id");
  ALTER TABLE "events" DROP COLUMN IF EXISTS "image_url_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "thumbnail_url";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_website";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_phone";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "logo_image_url_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "main_image_url_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_website";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_phone";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "logo_image_url_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "main_image_url_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "main_image_url_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "thumbnail_url";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "location_name";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "location_address";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "is_featured";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "type";
  DROP TYPE "public"."enum_promotions_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_promotions_type" AS ENUM('event', 'attraction', 'dining', 'shop');
  CREATE TABLE IF NOT EXISTS "shops_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  ALTER TABLE "shops_images_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "shops_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dinings_images_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dinings_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shops_images_gallery" CASCADE;
  DROP TABLE "shops_tags" CASCADE;
  DROP TABLE "dinings_images_gallery" CASCADE;
  DROP TABLE "dinings_tags" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT "events_images_cover_photo_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_images_facebook_image_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_location_floor_id_floors_id_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_dinings_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_shops_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_attractions_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_promotions_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_images_logo_id_media_id_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_images_main_image_id_media_id_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "shops" DROP CONSTRAINT "shops_images_facebook_image_id_media_id_fk";
  
  ALTER TABLE "shops_rels" DROP CONSTRAINT "shops_rels_dinings_fk";
  
  ALTER TABLE "shops_rels" DROP CONSTRAINT "shops_rels_shops_fk";
  
  ALTER TABLE "shops_rels" DROP CONSTRAINT "shops_rels_promotions_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_images_logo_id_media_id_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_images_main_image_id_media_id_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "dinings" DROP CONSTRAINT "dinings_images_facebook_image_id_media_id_fk";
  
  ALTER TABLE "dinings_rels" DROP CONSTRAINT "dinings_rels_dinings_fk";
  
  ALTER TABLE "dinings_rels" DROP CONSTRAINT "dinings_rels_shops_fk";
  
  ALTER TABLE "dinings_rels" DROP CONSTRAINT "dinings_rels_promotions_fk";
  
  ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_cover_photo_id_media_id_fk";
  
  ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_thumbnail_id_media_id_fk";
  
  ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_facebook_image_id_media_id_fk";
  
  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_dinings_fk";
  
  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_shops_fk";
  
  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_attractions_fk";
  
  ALTER TABLE "promotions_rels" DROP CONSTRAINT "promotions_rels_events_fk";
  
  DROP INDEX IF EXISTS "events_images_images_cover_photo_idx";
  DROP INDEX IF EXISTS "events_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "events_images_images_facebook_image_idx";
  DROP INDEX IF EXISTS "events_location_location_floor_idx";
  DROP INDEX IF EXISTS "events_rels_dinings_id_idx";
  DROP INDEX IF EXISTS "events_rels_shops_id_idx";
  DROP INDEX IF EXISTS "events_rels_attractions_id_idx";
  DROP INDEX IF EXISTS "events_rels_promotions_id_idx";
  DROP INDEX IF EXISTS "shops_images_images_logo_idx";
  DROP INDEX IF EXISTS "shops_images_images_main_image_idx";
  DROP INDEX IF EXISTS "shops_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "shops_images_images_facebook_image_idx";
  DROP INDEX IF EXISTS "shops_rels_dinings_id_idx";
  DROP INDEX IF EXISTS "shops_rels_shops_id_idx";
  DROP INDEX IF EXISTS "shops_rels_promotions_id_idx";
  DROP INDEX IF EXISTS "dinings_images_images_logo_idx";
  DROP INDEX IF EXISTS "dinings_images_images_main_image_idx";
  DROP INDEX IF EXISTS "dinings_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "dinings_images_images_facebook_image_idx";
  DROP INDEX IF EXISTS "dinings_rels_dinings_id_idx";
  DROP INDEX IF EXISTS "dinings_rels_shops_id_idx";
  DROP INDEX IF EXISTS "dinings_rels_promotions_id_idx";
  DROP INDEX IF EXISTS "categories_original_id_idx";
  DROP INDEX IF EXISTS "promotions_images_images_cover_photo_idx";
  DROP INDEX IF EXISTS "promotions_images_images_thumbnail_idx";
  DROP INDEX IF EXISTS "promotions_images_images_facebook_image_idx";
  DROP INDEX IF EXISTS "promotions_rels_dinings_id_idx";
  DROP INDEX IF EXISTS "promotions_rels_shops_id_idx";
  DROP INDEX IF EXISTS "promotions_rels_attractions_id_idx";
  DROP INDEX IF EXISTS "promotions_rels_events_id_idx";
  ALTER TABLE "events" ALTER COLUMN "is_featured" DROP DEFAULT;
  ALTER TABLE "events_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "promotions_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "events" ADD COLUMN "image_url_id" integer;
  ALTER TABLE "events" ADD COLUMN "thumbnail_url" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_website" varchar;
  ALTER TABLE "shops" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "shops" ADD COLUMN "logo_image_url_id" integer;
  ALTER TABLE "shops" ADD COLUMN "main_image_url_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "contact_website" varchar;
  ALTER TABLE "dinings" ADD COLUMN "contact_phone" varchar;
  ALTER TABLE "dinings" ADD COLUMN "logo_image_url_id" integer;
  ALTER TABLE "dinings" ADD COLUMN "main_image_url_id" integer;
  ALTER TABLE "promotions" ADD COLUMN "main_image_url_id" integer;
  ALTER TABLE "promotions" ADD COLUMN "thumbnail_url" varchar;
  ALTER TABLE "promotions" ADD COLUMN "location_name" varchar;
  ALTER TABLE "promotions" ADD COLUMN "location_address" varchar;
  ALTER TABLE "promotions" ADD COLUMN "is_featured" boolean;
  ALTER TABLE "promotions" ADD COLUMN "type" "enum_promotions_type";
  DO $$ BEGIN
   ALTER TABLE "shops_gallery_image_urls" ADD CONSTRAINT "shops_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_gallery_image_urls" ADD CONSTRAINT "shops_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_gallery_image_urls" ADD CONSTRAINT "dinings_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_gallery_image_urls" ADD CONSTRAINT "dinings_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_order_idx" ON "shops_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_parent_id_idx" ON "shops_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_image_url_idx" ON "shops_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_order_idx" ON "dinings_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_parent_id_idx" ON "dinings_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_image_url_idx" ON "dinings_gallery_image_urls" USING btree ("image_url_id");
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_logo_image_url_id_media_id_fk" FOREIGN KEY ("logo_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_logo_image_url_id_media_id_fk" FOREIGN KEY ("logo_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "events_image_url_idx" ON "events" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "shops_logo_image_url_idx" ON "shops" USING btree ("logo_image_url_id");
  CREATE INDEX IF NOT EXISTS "shops_main_image_url_idx" ON "shops" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_logo_image_url_idx" ON "dinings" USING btree ("logo_image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_main_image_url_idx" ON "dinings" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "promotions_main_image_url_idx" ON "promotions" USING btree ("main_image_url_id");
  ALTER TABLE "events" DROP COLUMN IF EXISTS "highlight";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "section_highlight";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "short_alphabet";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "show_time";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "sort_order";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_cover_photo_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "images_facebook_image_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "location_floor_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "location_zone";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "promotion_type";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "system_original_id";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "system_cid";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "system_scid";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "system_create_by";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "system_modified_at";
  ALTER TABLE "events_locales" DROP COLUMN IF EXISTS "meta_keywords";
  ALTER TABLE "events_rels" DROP COLUMN IF EXISTS "dinings_id";
  ALTER TABLE "events_rels" DROP COLUMN IF EXISTS "shops_id";
  ALTER TABLE "events_rels" DROP COLUMN IF EXISTS "attractions_id";
  ALTER TABLE "events_rels" DROP COLUMN IF EXISTS "promotions_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "location_coordinates_poi_x";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "location_coordinates_poi_y";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_website";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_phone";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_instagram_url";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_facebook_url";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_wechat_account";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_line_account";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "contact_info_weibo_url";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "images_logo_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "images_main_image_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "images_facebook_image_id";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "date_range_start_date";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "date_range_end_date";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "short_alphabet";
  ALTER TABLE "shops" DROP COLUMN IF EXISTS "sort_order";
  ALTER TABLE "shops_rels" DROP COLUMN IF EXISTS "dinings_id";
  ALTER TABLE "shops_rels" DROP COLUMN IF EXISTS "shops_id";
  ALTER TABLE "shops_rels" DROP COLUMN IF EXISTS "promotions_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "location_coordinates_poi_x";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "location_coordinates_poi_y";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_website";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_phone";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_instagram_url";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_facebook_url";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_wechat_account";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_line_account";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "contact_info_weibo_url";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "images_logo_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "images_main_image_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "images_facebook_image_id";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "date_range_start_date";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "date_range_end_date";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "short_alphabet";
  ALTER TABLE "dinings" DROP COLUMN IF EXISTS "sort_order";
  ALTER TABLE "dinings_rels" DROP COLUMN IF EXISTS "dinings_id";
  ALTER TABLE "dinings_rels" DROP COLUMN IF EXISTS "shops_id";
  ALTER TABLE "dinings_rels" DROP COLUMN IF EXISTS "promotions_id";
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "original_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "highlight";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "section_highlight";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "short_alphabet";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "show_time";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "pin_to_home";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "pin_to_section";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "sort_order";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "images_cover_photo_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "images_thumbnail_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "images_facebook_image_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "promotion_type";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "system_original_id";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "system_cid";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "system_scid";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "system_create_by";
  ALTER TABLE "promotions" DROP COLUMN IF EXISTS "system_modified_at";
  ALTER TABLE "promotions_locales" DROP COLUMN IF EXISTS "meta_keywords";
  ALTER TABLE "promotions_rels" DROP COLUMN IF EXISTS "dinings_id";
  ALTER TABLE "promotions_rels" DROP COLUMN IF EXISTS "shops_id";
  ALTER TABLE "promotions_rels" DROP COLUMN IF EXISTS "attractions_id";
  ALTER TABLE "promotions_rels" DROP COLUMN IF EXISTS "events_id";
  DROP TYPE "public"."enum_events_promotion_type";`)
}
