import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_banners_custom_banner_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"banner_image_id" integer
  );
  
  ALTER TABLE "page_banners_locales" ADD COLUMN "custom_banner_section_title" varchar;
  ALTER TABLE "page_banners_locales" ADD COLUMN "custom_banner_section_subtitle" varchar;
  ALTER TABLE "page_banners_custom_banner_images" ADD CONSTRAINT "page_banners_custom_banner_images_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_banners_custom_banner_images" ADD CONSTRAINT "page_banners_custom_banner_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_banners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_banners_custom_banner_images_order_idx" ON "page_banners_custom_banner_images" USING btree ("_order");
  CREATE INDEX "page_banners_custom_banner_images_parent_id_idx" ON "page_banners_custom_banner_images" USING btree ("_parent_id");
  CREATE INDEX "page_banners_custom_banner_images_locale_idx" ON "page_banners_custom_banner_images" USING btree ("_locale");
  CREATE INDEX "page_banners_custom_banner_images_banner_image_idx" ON "page_banners_custom_banner_images" USING btree ("banner_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_banners_custom_banner_images" CASCADE;
  ALTER TABLE "page_banners_locales" DROP COLUMN "custom_banner_section_title";
  ALTER TABLE "page_banners_locales" DROP COLUMN "custom_banner_section_subtitle";`)
}
