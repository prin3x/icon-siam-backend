import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "homepage_extraordinary_shopping" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cover_image_id" integer,
  	"path_to_page" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_extraordinary_shopping_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "homepage_extraordinary_shopping" ADD CONSTRAINT "homepage_extraordinary_shopping_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_extraordinary_shopping" ADD CONSTRAINT "homepage_extraordinary_shopping_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_extraordinary_shopping_locales" ADD CONSTRAINT "homepage_extraordinary_shopping_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_extraordinary_shopping"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_extraordinary_shopping_order_idx" ON "homepage_extraordinary_shopping" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_extraordinary_shopping_parent_id_idx" ON "homepage_extraordinary_shopping" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_extraordinary_shopping_cover_image_idx" ON "homepage_extraordinary_shopping" USING btree ("cover_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_extraordinary_shopping_locales_locale_parent_id_unique" ON "homepage_extraordinary_shopping_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "extraordinary_shopping_icon_luxe";
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "extraordinary_shopping_icon_craft";
  ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "extraordinary_shopping_custom_shop_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_extraordinary_shopping" CASCADE;
  DROP TABLE "homepage_extraordinary_shopping_locales" CASCADE;
  ALTER TABLE "homepage" ADD COLUMN "extraordinary_shopping_icon_luxe" boolean DEFAULT true;
  ALTER TABLE "homepage" ADD COLUMN "extraordinary_shopping_icon_craft" boolean DEFAULT true;
  ALTER TABLE "homepage_locales" ADD COLUMN "extraordinary_shopping_custom_shop_description" varchar;`)
}
