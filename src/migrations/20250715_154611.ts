import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_news_press_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_stories_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TABLE "news_press" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"section_highlight" varchar,
  	"short_alphabet" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"show_time" varchar,
  	"status" "enum_news_press_status" DEFAULT 'ACTIVE' NOT NULL,
  	"pin_to_home" boolean DEFAULT false,
  	"pin_to_section" boolean DEFAULT false,
  	"sort_order" numeric,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_press_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"content" jsonb,
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"images_cover_photo_id" integer,
  	"images_thumbnail_id" integer,
  	"images_facebook_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_press_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"dinings_id" integer,
  	"shops_id" integer,
  	"attractions_id" integer,
  	"events_id" integer,
  	"promotions_id" integer
  );
  
  CREATE TABLE "stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"section_highlight" varchar,
  	"short_alphabet" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"show_time" varchar,
  	"status" "enum_stories_status" DEFAULT 'ACTIVE' NOT NULL,
  	"pin_to_home" boolean DEFAULT false,
  	"pin_to_section" boolean DEFAULT false,
  	"sort_order" numeric,
  	"system_original_id" numeric,
  	"system_cid" varchar,
  	"system_scid" varchar,
  	"system_create_by" varchar,
  	"system_modified_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stories_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"content" jsonb,
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"images_cover_photo_id" integer,
  	"images_thumbnail_id" integer,
  	"images_facebook_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"dinings_id" integer,
  	"shops_id" integer,
  	"attractions_id" integer,
  	"events_id" integer,
  	"promotions_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_press_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stories_id" integer;
  ALTER TABLE "news_press_locales" ADD CONSTRAINT "news_press_locales_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_press_locales" ADD CONSTRAINT "news_press_locales_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_press_locales" ADD CONSTRAINT "news_press_locales_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_press_locales" ADD CONSTRAINT "news_press_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_press"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_press"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_press_rels" ADD CONSTRAINT "news_press_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "news_press_slug_idx" ON "news_press" USING btree ("slug");
  CREATE INDEX "news_press_updated_at_idx" ON "news_press" USING btree ("updated_at");
  CREATE INDEX "news_press_created_at_idx" ON "news_press" USING btree ("created_at");
  CREATE INDEX "news_press_images_images_cover_photo_idx" ON "news_press_locales" USING btree ("images_cover_photo_id","_locale");
  CREATE INDEX "news_press_images_images_thumbnail_idx" ON "news_press_locales" USING btree ("images_thumbnail_id","_locale");
  CREATE INDEX "news_press_images_images_facebook_image_idx" ON "news_press_locales" USING btree ("images_facebook_image_id","_locale");
  CREATE UNIQUE INDEX "news_press_locales_locale_parent_id_unique" ON "news_press_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_press_rels_order_idx" ON "news_press_rels" USING btree ("order");
  CREATE INDEX "news_press_rels_parent_idx" ON "news_press_rels" USING btree ("parent_id");
  CREATE INDEX "news_press_rels_path_idx" ON "news_press_rels" USING btree ("path");
  CREATE INDEX "news_press_rels_categories_id_idx" ON "news_press_rels" USING btree ("categories_id");
  CREATE INDEX "news_press_rels_dinings_id_idx" ON "news_press_rels" USING btree ("dinings_id");
  CREATE INDEX "news_press_rels_shops_id_idx" ON "news_press_rels" USING btree ("shops_id");
  CREATE INDEX "news_press_rels_attractions_id_idx" ON "news_press_rels" USING btree ("attractions_id");
  CREATE INDEX "news_press_rels_events_id_idx" ON "news_press_rels" USING btree ("events_id");
  CREATE INDEX "news_press_rels_promotions_id_idx" ON "news_press_rels" USING btree ("promotions_id");
  CREATE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE INDEX "stories_images_images_cover_photo_idx" ON "stories_locales" USING btree ("images_cover_photo_id","_locale");
  CREATE INDEX "stories_images_images_thumbnail_idx" ON "stories_locales" USING btree ("images_thumbnail_id","_locale");
  CREATE INDEX "stories_images_images_facebook_image_idx" ON "stories_locales" USING btree ("images_facebook_image_id","_locale");
  CREATE UNIQUE INDEX "stories_locales_locale_parent_id_unique" ON "stories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "stories_rels_order_idx" ON "stories_rels" USING btree ("order");
  CREATE INDEX "stories_rels_parent_idx" ON "stories_rels" USING btree ("parent_id");
  CREATE INDEX "stories_rels_path_idx" ON "stories_rels" USING btree ("path");
  CREATE INDEX "stories_rels_categories_id_idx" ON "stories_rels" USING btree ("categories_id");
  CREATE INDEX "stories_rels_dinings_id_idx" ON "stories_rels" USING btree ("dinings_id");
  CREATE INDEX "stories_rels_shops_id_idx" ON "stories_rels" USING btree ("shops_id");
  CREATE INDEX "stories_rels_attractions_id_idx" ON "stories_rels" USING btree ("attractions_id");
  CREATE INDEX "stories_rels_events_id_idx" ON "stories_rels" USING btree ("events_id");
  CREATE INDEX "stories_rels_promotions_id_idx" ON "stories_rels" USING btree ("promotions_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_press_fk" FOREIGN KEY ("news_press_id") REFERENCES "public"."news_press"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_news_press_id_idx" ON "payload_locked_documents_rels" USING btree ("news_press_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_press" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_press_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_press_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stories_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "news_press" CASCADE;
  DROP TABLE "news_press_locales" CASCADE;
  DROP TABLE "news_press_rels" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "stories_locales" CASCADE;
  DROP TABLE "stories_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_press_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stories_fk";
  
  DROP INDEX "payload_locked_documents_rels_news_press_id_idx";
  DROP INDEX "payload_locked_documents_rels_stories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_press_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stories_id";
  DROP TYPE "public"."enum_news_press_status";
  DROP TYPE "public"."enum_stories_status";`)
}
