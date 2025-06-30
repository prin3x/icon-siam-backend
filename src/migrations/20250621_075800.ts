import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footers_connect_with_us" ADD COLUMN "image_icon_id" integer;
  DO $$ BEGIN
   ALTER TABLE "footers_connect_with_us" ADD CONSTRAINT "footers_connect_with_us_image_icon_id_media_id_fk" FOREIGN KEY ("image_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "footers_connect_with_us_image_icon_idx" ON "footers_connect_with_us" USING btree ("image_icon_id");
  ALTER TABLE "users" DROP COLUMN IF EXISTS "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "api_key";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "api_key_index";
  ALTER TABLE "footers_connect_with_us" DROP COLUMN IF EXISTS "icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footers_connect_with_us" DROP CONSTRAINT "footers_connect_with_us_image_icon_id_media_id_fk";
  
  DROP INDEX IF EXISTS "footers_connect_with_us_image_icon_idx";
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "footers_connect_with_us" ADD COLUMN "icon" varchar;
  ALTER TABLE "footers_connect_with_us" DROP COLUMN IF EXISTS "image_icon_id";`)
}
