import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_residences_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TABLE "residences_residence_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"image_id" integer,
  	"sort_order" numeric DEFAULT 0,
  	"call_to_action_link" varchar
  );
  
  CREATE TABLE "residences_residence_sections_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"call_to_action_text" varchar DEFAULT 'GO TO WEBSITE',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "residences_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "residences_gallery_images_locales" (
  	"alt_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "residences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_residences_status" DEFAULT 'ACTIVE' NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "residences_locales" (
  	"title" varchar DEFAULT 'RESIDENCES' NOT NULL,
  	"gallery_title" varchar,
  	"gallery_description" varchar,
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "residences_id" integer;
  ALTER TABLE "residences_residence_sections" ADD CONSTRAINT "residences_residence_sections_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residences_residence_sections" ADD CONSTRAINT "residences_residence_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residences_residence_sections" ADD CONSTRAINT "residences_residence_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residences_residence_sections_locales" ADD CONSTRAINT "residences_residence_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences_residence_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residences_gallery_images" ADD CONSTRAINT "residences_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "residences_gallery_images" ADD CONSTRAINT "residences_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residences_gallery_images_locales" ADD CONSTRAINT "residences_gallery_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences_gallery_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "residences_locales" ADD CONSTRAINT "residences_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "residences_residence_sections_order_idx" ON "residences_residence_sections" USING btree ("_order");
  CREATE INDEX "residences_residence_sections_parent_id_idx" ON "residences_residence_sections" USING btree ("_parent_id");
  CREATE INDEX "residences_residence_sections_logo_idx" ON "residences_residence_sections" USING btree ("logo_id");
  CREATE INDEX "residences_residence_sections_image_idx" ON "residences_residence_sections" USING btree ("image_id");
  CREATE UNIQUE INDEX "residences_residence_sections_locales_locale_parent_id_unique" ON "residences_residence_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "residences_gallery_images_order_idx" ON "residences_gallery_images" USING btree ("_order");
  CREATE INDEX "residences_gallery_images_parent_id_idx" ON "residences_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "residences_gallery_images_image_idx" ON "residences_gallery_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "residences_gallery_images_locales_locale_parent_id_unique" ON "residences_gallery_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "residences_slug_idx" ON "residences" USING btree ("slug");
  CREATE INDEX "residences_updated_at_idx" ON "residences" USING btree ("updated_at");
  CREATE INDEX "residences_created_at_idx" ON "residences" USING btree ("created_at");
  CREATE UNIQUE INDEX "residences_locales_locale_parent_id_unique" ON "residences_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_residences_fk" FOREIGN KEY ("residences_id") REFERENCES "public"."residences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_residences_id_idx" ON "payload_locked_documents_rels" USING btree ("residences_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "residences_residence_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residences_residence_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residences_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residences_gallery_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "residences_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "residences_residence_sections" CASCADE;
  DROP TABLE "residences_residence_sections_locales" CASCADE;
  DROP TABLE "residences_gallery_images" CASCADE;
  DROP TABLE "residences_gallery_images_locales" CASCADE;
  DROP TABLE "residences" CASCADE;
  DROP TABLE "residences_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_residences_fk";
  
  DROP INDEX "payload_locked_documents_rels_residences_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "residences_id";
  DROP TYPE "public"."enum_residences_status";`)
}
