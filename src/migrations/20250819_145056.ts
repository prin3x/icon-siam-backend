import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_banners_config_section_config" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"key" varchar,
  	"status" boolean
  );
  
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "page_banners_config_section_config" ADD CONSTRAINT "page_banners_config_section_config_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_banners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_banners_config_section_config_order_idx" ON "page_banners_config_section_config" USING btree ("_order");
  CREATE INDEX "page_banners_config_section_config_parent_id_idx" ON "page_banners_config_section_config" USING btree ("_parent_id");`)

  // Insert initial data for 'Related Promotions'
  await db.execute(sql`
    INSERT INTO "page_banners_config_section_config" ("_order", "_parent_id", "id", "name", "key", "status")
    VALUES (0, 19, 'section-related-promotion', 'Related Section', 'RELATED_SECTION', true)
    ON CONFLICT (id) DO NOTHING;`)
  // Insert initial data for 'Related Events'
  await db.execute(sql`
    INSERT INTO "page_banners_config_section_config" ("_order", "_parent_id", "id", "name", "key", "status")
    VALUES (0, 5, 'section-related-events', 'Related Section', 'RELATED_SECTION', true)
    ON CONFLICT (id) DO NOTHING;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_banners_config_section_config" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_banners_config_section_config" CASCADE;
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ALTER COLUMN "title" SET NOT NULL;`)
}
