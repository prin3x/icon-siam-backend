import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "residences_residence_sections_locales" CASCADE;
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "residences_residence_sections" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en'::"_locales";
  ALTER TABLE "residences_residence_sections" ADD COLUMN "title" varchar NOT NULL DEFAULT '';
  ALTER TABLE "residences_residence_sections" ADD COLUMN "description" varchar;
  ALTER TABLE "residences_residence_sections" ADD COLUMN "call_to_action_text" varchar DEFAULT 'GO TO WEBSITE';
  CREATE INDEX "residences_residence_sections_locale_idx" ON "residences_residence_sections" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "residences_residence_sections_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"call_to_action_text" varchar DEFAULT 'GO TO WEBSITE',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  DROP INDEX "residences_residence_sections_locale_idx";
  ALTER TABLE "about_iconsiam_awards_awards_list_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "residences_residence_sections_locales" ADD CONSTRAINT "residences_residence_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."residences_residence_sections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "residences_residence_sections_locales_locale_parent_id_unique" ON "residences_residence_sections_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "residences_residence_sections" DROP COLUMN "_locale";
  ALTER TABLE "residences_residence_sections" DROP COLUMN "title";
  ALTER TABLE "residences_residence_sections" DROP COLUMN "description";
  ALTER TABLE "residences_residence_sections" DROP COLUMN "call_to_action_text";`)
}
