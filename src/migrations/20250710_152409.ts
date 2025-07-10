import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "icon_craft_content_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "icon_craft_content_locales" ADD CONSTRAINT "icon_craft_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft_content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "icon_craft_content_locales_locale_parent_id_unique" ON "icon_craft_content_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "icon_craft_content" DROP COLUMN "title";
  ALTER TABLE "icon_craft_content" DROP COLUMN "description";
  ALTER TABLE "icon_craft_locales" DROP COLUMN "showcase_title";
  ALTER TABLE "icon_craft_locales" DROP COLUMN "showcase_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "icon_craft_content_locales" CASCADE;
  ALTER TABLE "icon_craft_content" ADD COLUMN "title" varchar;
  ALTER TABLE "icon_craft_content" ADD COLUMN "description" varchar;
  ALTER TABLE "icon_craft_locales" ADD COLUMN "showcase_title" varchar;
  ALTER TABLE "icon_craft_locales" ADD COLUMN "showcase_description" varchar;`)
}
