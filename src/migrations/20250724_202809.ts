import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "facilities_bank_section_section_contents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "facilities_post_office_section_section_contents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "facilities_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_icon_id" integer,
  	"floor_id" integer,
  	"location_zone" varchar
  );
  
  CREATE TABLE "facilities_services_locales" (
  	"service_name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "facilities_facilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_icon_id" integer,
  	"floor_id" integer,
  	"location_zone" varchar
  );
  
  CREATE TABLE "facilities_facilities_locales" (
  	"facility_name" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "facilities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"banner_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "facilities_locales" (
  	"title" varchar DEFAULT 'Facilities',
  	"bank_section_section_name" varchar,
  	"post_office_section_section_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "facilities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"shops_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "facilities_id" integer;
  ALTER TABLE "facilities_bank_section_section_contents" ADD CONSTRAINT "facilities_bank_section_section_contents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_post_office_section_section_contents" ADD CONSTRAINT "facilities_post_office_section_section_contents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_services" ADD CONSTRAINT "facilities_services_image_icon_id_media_id_fk" FOREIGN KEY ("image_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_services" ADD CONSTRAINT "facilities_services_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_services" ADD CONSTRAINT "facilities_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_services_locales" ADD CONSTRAINT "facilities_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_facilities" ADD CONSTRAINT "facilities_facilities_image_icon_id_media_id_fk" FOREIGN KEY ("image_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_facilities" ADD CONSTRAINT "facilities_facilities_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_facilities" ADD CONSTRAINT "facilities_facilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_facilities_locales" ADD CONSTRAINT "facilities_facilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities_facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities" ADD CONSTRAINT "facilities_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_locales" ADD CONSTRAINT "facilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_rels" ADD CONSTRAINT "facilities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "facilities_rels" ADD CONSTRAINT "facilities_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "facilities_bank_section_section_contents_order_idx" ON "facilities_bank_section_section_contents" USING btree ("_order");
  CREATE INDEX "facilities_bank_section_section_contents_parent_id_idx" ON "facilities_bank_section_section_contents" USING btree ("_parent_id");
  CREATE INDEX "facilities_post_office_section_section_contents_order_idx" ON "facilities_post_office_section_section_contents" USING btree ("_order");
  CREATE INDEX "facilities_post_office_section_section_contents_parent_id_idx" ON "facilities_post_office_section_section_contents" USING btree ("_parent_id");
  CREATE INDEX "facilities_services_order_idx" ON "facilities_services" USING btree ("_order");
  CREATE INDEX "facilities_services_parent_id_idx" ON "facilities_services" USING btree ("_parent_id");
  CREATE INDEX "facilities_services_image_icon_idx" ON "facilities_services" USING btree ("image_icon_id");
  CREATE INDEX "facilities_services_floor_idx" ON "facilities_services" USING btree ("floor_id");
  CREATE UNIQUE INDEX "facilities_services_locales_locale_parent_id_unique" ON "facilities_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "facilities_facilities_order_idx" ON "facilities_facilities" USING btree ("_order");
  CREATE INDEX "facilities_facilities_parent_id_idx" ON "facilities_facilities" USING btree ("_parent_id");
  CREATE INDEX "facilities_facilities_image_icon_idx" ON "facilities_facilities" USING btree ("image_icon_id");
  CREATE INDEX "facilities_facilities_floor_idx" ON "facilities_facilities" USING btree ("floor_id");
  CREATE UNIQUE INDEX "facilities_facilities_locales_locale_parent_id_unique" ON "facilities_facilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "facilities_banner_image_idx" ON "facilities" USING btree ("banner_image_id");
  CREATE INDEX "facilities_updated_at_idx" ON "facilities" USING btree ("updated_at");
  CREATE INDEX "facilities_created_at_idx" ON "facilities" USING btree ("created_at");
  CREATE UNIQUE INDEX "facilities_locales_locale_parent_id_unique" ON "facilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "facilities_rels_order_idx" ON "facilities_rels" USING btree ("order");
  CREATE INDEX "facilities_rels_parent_idx" ON "facilities_rels" USING btree ("parent_id");
  CREATE INDEX "facilities_rels_path_idx" ON "facilities_rels" USING btree ("path");
  CREATE INDEX "facilities_rels_shops_id_idx" ON "facilities_rels" USING btree ("shops_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facilities_fk" FOREIGN KEY ("facilities_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_facilities_id_idx" ON "payload_locked_documents_rels" USING btree ("facilities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "facilities_bank_section_section_contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_post_office_section_section_contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_facilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_facilities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "facilities_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "facilities_bank_section_section_contents" CASCADE;
  DROP TABLE "facilities_post_office_section_section_contents" CASCADE;
  DROP TABLE "facilities_services" CASCADE;
  DROP TABLE "facilities_services_locales" CASCADE;
  DROP TABLE "facilities_facilities" CASCADE;
  DROP TABLE "facilities_facilities_locales" CASCADE;
  DROP TABLE "facilities" CASCADE;
  DROP TABLE "facilities_locales" CASCADE;
  DROP TABLE "facilities_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_facilities_fk";
  
  DROP INDEX "payload_locked_documents_rels_facilities_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "facilities_id";`)
}
