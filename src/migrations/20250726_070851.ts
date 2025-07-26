import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_about_iconsiam_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_board_of_directors_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_iconsiam_awards_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_vision_mission_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TABLE "about_iconsiam_development_partners_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer
  );
  
  CREATE TABLE "about_iconsiam_awards_awards_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "about_iconsiam_awards_awards_list_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_iconsiam" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"status" "enum_about_iconsiam_status" DEFAULT 'ACTIVE' NOT NULL,
  	"about_iconsiam_image_id" integer,
  	"development_partners_image_id" integer,
  	"board_of_directors_image_id" integer,
  	"vision_mission_image_id" integer,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "about_iconsiam_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"about_iconsiam_title" varchar DEFAULT 'ABOUT ICONSIAM',
  	"about_iconsiam_description" varchar,
  	"development_partners_title" varchar DEFAULT 'DEVELOPMENT PARTNERS',
  	"development_partners_description" varchar,
  	"board_of_directors_title" varchar DEFAULT 'BOARD OF DIRECTORS',
  	"board_of_directors_description" varchar,
  	"vision_mission_title" varchar DEFAULT 'VISION AND MISSION',
  	"vision_mission_description" varchar,
  	"awards_title" varchar DEFAULT 'ICONSIAM AWARDS',
  	"awards_description" varchar,
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "board_of_directors_directors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"profile_image_id" integer NOT NULL,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "board_of_directors_directors_locales" (
  	"full_name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "board_of_directors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"status" "enum_board_of_directors_status" DEFAULT 'ACTIVE' NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "board_of_directors_locales" (
  	"title" varchar DEFAULT 'BOARD OF DIRECTORS' NOT NULL,
  	"subtitle" varchar,
  	"description" varchar DEFAULT 'ICONSIAM''s Board of Directors comprises visionary leaders shaping its success as a global landmark for shopping, culture, and lifestyle.',
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards_featured_awards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"award_image_id" integer NOT NULL,
  	"year" varchar,
  	"category" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "iconsiam_awards_featured_awards_locales" (
  	"award_title" varchar NOT NULL,
  	"award_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards_awards_by_year" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards_awards_by_year_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"status" "enum_iconsiam_awards_status" DEFAULT 'ACTIVE' NOT NULL,
  	"call_to_action_link" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "iconsiam_awards_locales" (
  	"title" varchar DEFAULT 'ICONSIAM AWARDS' NOT NULL,
  	"subtitle" varchar,
  	"description" varchar DEFAULT 'ICONSIAM proudly holds prestigious awards, celebrating its excellence in design, retail, culture, and lifestyle as a global and Thai landmark.',
  	"call_to_action_text" varchar DEFAULT 'Discover More',
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "vision_mission_content_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "vision_mission_content_sections_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "vision_mission" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"status" "enum_vision_mission_status" DEFAULT 'ACTIVE' NOT NULL,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vision_mission_locales" (
  	"title" varchar DEFAULT 'VISION AND MISSION' NOT NULL,
  	"subtitle" varchar,
  	"intro_text" varchar,
  	"seo_keywords" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "about_iconsiam_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "board_of_directors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "iconsiam_awards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vision_mission_id" integer;
  ALTER TABLE "about_iconsiam_development_partners_partners" ADD CONSTRAINT "about_iconsiam_development_partners_partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_development_partners_partners" ADD CONSTRAINT "about_iconsiam_development_partners_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD CONSTRAINT "about_iconsiam_awards_awards_list_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_awards_awards_list" ADD CONSTRAINT "about_iconsiam_awards_awards_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ADD CONSTRAINT "about_iconsiam_awards_awards_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam_awards_awards_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_about_iconsiam_image_id_media_id_fk" FOREIGN KEY ("about_iconsiam_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_development_partners_image_id_media_id_fk" FOREIGN KEY ("development_partners_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_board_of_directors_image_id_media_id_fk" FOREIGN KEY ("board_of_directors_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam" ADD CONSTRAINT "about_iconsiam_vision_mission_image_id_media_id_fk" FOREIGN KEY ("vision_mission_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_iconsiam_locales" ADD CONSTRAINT "about_iconsiam_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_iconsiam"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "board_of_directors_directors" ADD CONSTRAINT "board_of_directors_directors_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "board_of_directors_directors" ADD CONSTRAINT "board_of_directors_directors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."board_of_directors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "board_of_directors_directors_locales" ADD CONSTRAINT "board_of_directors_directors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."board_of_directors_directors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "board_of_directors" ADD CONSTRAINT "board_of_directors_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "board_of_directors_locales" ADD CONSTRAINT "board_of_directors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."board_of_directors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_featured_awards" ADD CONSTRAINT "iconsiam_awards_featured_awards_award_image_id_media_id_fk" FOREIGN KEY ("award_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_featured_awards" ADD CONSTRAINT "iconsiam_awards_featured_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_featured_awards_locales" ADD CONSTRAINT "iconsiam_awards_featured_awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards_featured_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_awards_by_year" ADD CONSTRAINT "iconsiam_awards_awards_by_year_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_awards_by_year_locales" ADD CONSTRAINT "iconsiam_awards_awards_by_year_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards_awards_by_year"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "iconsiam_awards" ADD CONSTRAINT "iconsiam_awards_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "iconsiam_awards_locales" ADD CONSTRAINT "iconsiam_awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."iconsiam_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vision_mission_content_sections" ADD CONSTRAINT "vision_mission_content_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vision_mission_content_sections" ADD CONSTRAINT "vision_mission_content_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vision_mission"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vision_mission_content_sections_locales" ADD CONSTRAINT "vision_mission_content_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vision_mission_content_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vision_mission" ADD CONSTRAINT "vision_mission_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vision_mission_locales" ADD CONSTRAINT "vision_mission_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vision_mission"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "about_iconsiam_development_partners_partners_order_idx" ON "about_iconsiam_development_partners_partners" USING btree ("_order");
  CREATE INDEX "about_iconsiam_development_partners_partners_parent_id_idx" ON "about_iconsiam_development_partners_partners" USING btree ("_parent_id");
  CREATE INDEX "about_iconsiam_development_partners_partners_logo_idx" ON "about_iconsiam_development_partners_partners" USING btree ("logo_id");
  CREATE INDEX "about_iconsiam_awards_awards_list_order_idx" ON "about_iconsiam_awards_awards_list" USING btree ("_order");
  CREATE INDEX "about_iconsiam_awards_awards_list_parent_id_idx" ON "about_iconsiam_awards_awards_list" USING btree ("_parent_id");
  CREATE INDEX "about_iconsiam_awards_awards_list_image_idx" ON "about_iconsiam_awards_awards_list" USING btree ("image_id");
  CREATE UNIQUE INDEX "about_iconsiam_awards_awards_list_locales_locale_parent_id_unique" ON "about_iconsiam_awards_awards_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_iconsiam_banner_image_idx" ON "about_iconsiam" USING btree ("banner_image_id");
  CREATE INDEX "about_iconsiam_about_iconsiam_about_iconsiam_image_idx" ON "about_iconsiam" USING btree ("about_iconsiam_image_id");
  CREATE INDEX "about_iconsiam_development_partners_development_partners_image_idx" ON "about_iconsiam" USING btree ("development_partners_image_id");
  CREATE INDEX "about_iconsiam_board_of_directors_board_of_directors_image_idx" ON "about_iconsiam" USING btree ("board_of_directors_image_id");
  CREATE INDEX "about_iconsiam_vision_mission_vision_mission_image_idx" ON "about_iconsiam" USING btree ("vision_mission_image_id");
  CREATE INDEX "about_iconsiam_slug_idx" ON "about_iconsiam" USING btree ("slug");
  CREATE INDEX "about_iconsiam_updated_at_idx" ON "about_iconsiam" USING btree ("updated_at");
  CREATE INDEX "about_iconsiam_created_at_idx" ON "about_iconsiam" USING btree ("created_at");
  CREATE UNIQUE INDEX "about_iconsiam_locales_locale_parent_id_unique" ON "about_iconsiam_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "board_of_directors_directors_order_idx" ON "board_of_directors_directors" USING btree ("_order");
  CREATE INDEX "board_of_directors_directors_parent_id_idx" ON "board_of_directors_directors" USING btree ("_parent_id");
  CREATE INDEX "board_of_directors_directors_profile_image_idx" ON "board_of_directors_directors" USING btree ("profile_image_id");
  CREATE UNIQUE INDEX "board_of_directors_directors_locales_locale_parent_id_unique" ON "board_of_directors_directors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "board_of_directors_banner_image_idx" ON "board_of_directors" USING btree ("banner_image_id");
  CREATE INDEX "board_of_directors_slug_idx" ON "board_of_directors" USING btree ("slug");
  CREATE INDEX "board_of_directors_updated_at_idx" ON "board_of_directors" USING btree ("updated_at");
  CREATE INDEX "board_of_directors_created_at_idx" ON "board_of_directors" USING btree ("created_at");
  CREATE UNIQUE INDEX "board_of_directors_locales_locale_parent_id_unique" ON "board_of_directors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "iconsiam_awards_featured_awards_order_idx" ON "iconsiam_awards_featured_awards" USING btree ("_order");
  CREATE INDEX "iconsiam_awards_featured_awards_parent_id_idx" ON "iconsiam_awards_featured_awards" USING btree ("_parent_id");
  CREATE INDEX "iconsiam_awards_featured_awards_award_image_idx" ON "iconsiam_awards_featured_awards" USING btree ("award_image_id");
  CREATE UNIQUE INDEX "iconsiam_awards_featured_awards_locales_locale_parent_id_unique" ON "iconsiam_awards_featured_awards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "iconsiam_awards_awards_by_year_order_idx" ON "iconsiam_awards_awards_by_year" USING btree ("_order");
  CREATE INDEX "iconsiam_awards_awards_by_year_parent_id_idx" ON "iconsiam_awards_awards_by_year" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "iconsiam_awards_awards_by_year_locales_locale_parent_id_unique" ON "iconsiam_awards_awards_by_year_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "iconsiam_awards_banner_image_idx" ON "iconsiam_awards" USING btree ("banner_image_id");
  CREATE INDEX "iconsiam_awards_slug_idx" ON "iconsiam_awards" USING btree ("slug");
  CREATE INDEX "iconsiam_awards_updated_at_idx" ON "iconsiam_awards" USING btree ("updated_at");
  CREATE INDEX "iconsiam_awards_created_at_idx" ON "iconsiam_awards" USING btree ("created_at");
  CREATE UNIQUE INDEX "iconsiam_awards_locales_locale_parent_id_unique" ON "iconsiam_awards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "vision_mission_content_sections_order_idx" ON "vision_mission_content_sections" USING btree ("_order");
  CREATE INDEX "vision_mission_content_sections_parent_id_idx" ON "vision_mission_content_sections" USING btree ("_parent_id");
  CREATE INDEX "vision_mission_content_sections_image_idx" ON "vision_mission_content_sections" USING btree ("image_id");
  CREATE UNIQUE INDEX "vision_mission_content_sections_locales_locale_parent_id_unique" ON "vision_mission_content_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "vision_mission_banner_image_idx" ON "vision_mission" USING btree ("banner_image_id");
  CREATE INDEX "vision_mission_slug_idx" ON "vision_mission" USING btree ("slug");
  CREATE INDEX "vision_mission_updated_at_idx" ON "vision_mission" USING btree ("updated_at");
  CREATE INDEX "vision_mission_created_at_idx" ON "vision_mission" USING btree ("created_at");
  CREATE UNIQUE INDEX "vision_mission_locales_locale_parent_id_unique" ON "vision_mission_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_about_iconsiam_fk" FOREIGN KEY ("about_iconsiam_id") REFERENCES "public"."about_iconsiam"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_board_of_directors_fk" FOREIGN KEY ("board_of_directors_id") REFERENCES "public"."board_of_directors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_iconsiam_awards_fk" FOREIGN KEY ("iconsiam_awards_id") REFERENCES "public"."iconsiam_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vision_mission_fk" FOREIGN KEY ("vision_mission_id") REFERENCES "public"."vision_mission"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_about_iconsiam_id_idx" ON "payload_locked_documents_rels" USING btree ("about_iconsiam_id");
  CREATE INDEX "payload_locked_documents_rels_board_of_directors_id_idx" ON "payload_locked_documents_rels" USING btree ("board_of_directors_id");
  CREATE INDEX "payload_locked_documents_rels_iconsiam_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("iconsiam_awards_id");
  CREATE INDEX "payload_locked_documents_rels_vision_mission_id_idx" ON "payload_locked_documents_rels" USING btree ("vision_mission_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_iconsiam_development_partners_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_iconsiam_awards_awards_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_iconsiam" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_iconsiam_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "board_of_directors_directors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "board_of_directors_directors_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "board_of_directors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "board_of_directors_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards_featured_awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards_featured_awards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards_awards_by_year" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards_awards_by_year_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "iconsiam_awards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vision_mission_content_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vision_mission_content_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vision_mission" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vision_mission_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "about_iconsiam_development_partners_partners" CASCADE;
  DROP TABLE "about_iconsiam_awards_awards_list" CASCADE;
  DROP TABLE "about_iconsiam_awards_awards_list_locales" CASCADE;
  DROP TABLE "about_iconsiam" CASCADE;
  DROP TABLE "about_iconsiam_locales" CASCADE;
  DROP TABLE "board_of_directors_directors" CASCADE;
  DROP TABLE "board_of_directors_directors_locales" CASCADE;
  DROP TABLE "board_of_directors" CASCADE;
  DROP TABLE "board_of_directors_locales" CASCADE;
  DROP TABLE "iconsiam_awards_featured_awards" CASCADE;
  DROP TABLE "iconsiam_awards_featured_awards_locales" CASCADE;
  DROP TABLE "iconsiam_awards_awards_by_year" CASCADE;
  DROP TABLE "iconsiam_awards_awards_by_year_locales" CASCADE;
  DROP TABLE "iconsiam_awards" CASCADE;
  DROP TABLE "iconsiam_awards_locales" CASCADE;
  DROP TABLE "vision_mission_content_sections" CASCADE;
  DROP TABLE "vision_mission_content_sections_locales" CASCADE;
  DROP TABLE "vision_mission" CASCADE;
  DROP TABLE "vision_mission_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_about_iconsiam_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_board_of_directors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_iconsiam_awards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vision_mission_fk";
  
  DROP INDEX "payload_locked_documents_rels_about_iconsiam_id_idx";
  DROP INDEX "payload_locked_documents_rels_board_of_directors_id_idx";
  DROP INDEX "payload_locked_documents_rels_iconsiam_awards_id_idx";
  DROP INDEX "payload_locked_documents_rels_vision_mission_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "about_iconsiam_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "board_of_directors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "iconsiam_awards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vision_mission_id";
  DROP TYPE "public"."enum_about_iconsiam_status";
  DROP TYPE "public"."enum_board_of_directors_status";
  DROP TYPE "public"."enum_iconsiam_awards_status";
  DROP TYPE "public"."enum_vision_mission_status";`)
}
