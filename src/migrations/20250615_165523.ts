import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_happening" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "homepage_happening" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_id" integer
  );
  
  DO $$ BEGIN
   ALTER TABLE "homepage_happening" ADD CONSTRAINT "homepage_happening_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_happening" ADD CONSTRAINT "homepage_happening_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_happening_order_idx" ON "homepage_happening" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_happening_parent_id_idx" ON "homepage_happening" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_happening_event_idx" ON "homepage_happening" USING btree ("event_id");`)
}
