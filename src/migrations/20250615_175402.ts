import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_shops" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_shops_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_shops" CASCADE;
  DROP TABLE "homepage_shops_locales" CASCADE;
  ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_icon_luxe_fk";
  
  ALTER TABLE "homepage_rels" DROP CONSTRAINT "homepage_rels_icon_craft_fk";
  
  DROP INDEX IF EXISTS "homepage_rels_icon_luxe_id_idx";
  DROP INDEX IF EXISTS "homepage_rels_icon_craft_id_idx";
  ALTER TABLE "homepage" ADD COLUMN "extraordinary_shopping_icon_luxe" boolean DEFAULT true;
  ALTER TABLE "homepage" ADD COLUMN "extraordinary_shopping_icon_craft" boolean DEFAULT true;
  ALTER TABLE "homepage_locales" ADD COLUMN "extraordinary_shopping_custom_shop_description" varchar;
  ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "custom_shops_title";
  ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "custom_shops_subtitle";
  ALTER TABLE "homepage_rels" DROP COLUMN IF EXISTS "icon_luxe_id";
  ALTER TABLE "homepage_rels" DROP COLUMN IF EXISTS "icon_craft_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "homepage_shops" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"custom_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_shops_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "homepage_locales" ADD COLUMN "custom_shops_title" varchar;
  ALTER TABLE "homepage_locales" ADD COLUMN "custom_shops_subtitle" varchar;
  ALTER TABLE "homepage_rels" ADD COLUMN "icon_luxe_id" integer;
  ALTER TABLE "homepage_rels" ADD COLUMN "icon_craft_id" integer;
  DO $$ BEGIN
   ALTER TABLE "homepage_shops" ADD CONSTRAINT "homepage_shops_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_shops" ADD CONSTRAINT "homepage_shops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_shops_locales" ADD CONSTRAINT "homepage_shops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_shops_order_idx" ON "homepage_shops" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_shops_parent_id_idx" ON "homepage_shops" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_shops_custom_image_idx" ON "homepage_shops" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_shops_locales_locale_parent_id_unique" ON "homepage_shops_locales" USING btree ("_locale","_parent_id");
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_icon_luxe_fk" FOREIGN KEY ("icon_luxe_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_icon_craft_fk" FOREIGN KEY ("icon_craft_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_rels_icon_luxe_id_idx" ON "homepage_rels" USING btree ("icon_luxe_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_icon_craft_id_idx" ON "homepage_rels" USING btree ("icon_craft_id");
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "extraordinary_shopping_icon_luxe";
  ALTER TABLE "homepage" DROP COLUMN IF EXISTS "extraordinary_shopping_icon_craft";
  ALTER TABLE "homepage_locales" DROP COLUMN IF EXISTS "extraordinary_shopping_custom_shop_description";`)
}
