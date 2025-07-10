import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "icon_craft_craft_highlight_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE "icon_craft_craft_highlight_content_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "icon_craft_locales" ADD COLUMN "craft_highlight_title" varchar;
  ALTER TABLE "icon_craft_locales" ADD COLUMN "craft_highlight_description" varchar;
  ALTER TABLE "icon_craft_craft_highlight_content" ADD CONSTRAINT "icon_craft_craft_highlight_content_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "icon_craft_craft_highlight_content" ADD CONSTRAINT "icon_craft_craft_highlight_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "icon_craft_craft_highlight_content_locales" ADD CONSTRAINT "icon_craft_craft_highlight_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft_craft_highlight_content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "icon_craft_craft_highlight_content_order_idx" ON "icon_craft_craft_highlight_content" USING btree ("_order");
  CREATE INDEX "icon_craft_craft_highlight_content_parent_id_idx" ON "icon_craft_craft_highlight_content" USING btree ("_parent_id");
  CREATE INDEX "icon_craft_craft_highlight_content_image_url_idx" ON "icon_craft_craft_highlight_content" USING btree ("image_url_id");
  CREATE UNIQUE INDEX "icon_craft_craft_highlight_content_locales_locale_parent_id_unique" ON "icon_craft_craft_highlight_content_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "icon_craft_craft_highlight_content" CASCADE;
  DROP TABLE "icon_craft_craft_highlight_content_locales" CASCADE;
  ALTER TABLE "icon_craft_locales" DROP COLUMN "craft_highlight_title";
  ALTER TABLE "icon_craft_locales" DROP COLUMN "craft_highlight_description";`)
}
