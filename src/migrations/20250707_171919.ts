import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footers_locales" (
  	"button_text" varchar,
  	"button_link" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "footers_locales" ADD CONSTRAINT "footers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "footers_locales_locale_parent_id_unique" ON "footers_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "footers_locales" CASCADE;`)
}
