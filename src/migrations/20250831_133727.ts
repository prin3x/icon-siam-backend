import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "iconsiam_awards" DROP CONSTRAINT "iconsiam_awards_banner_image_id_media_id_fk";
  
  DROP INDEX "iconsiam_awards_banner_image_idx";
  ALTER TABLE "iconsiam_awards" DROP COLUMN "banner_image_id";
  ALTER TABLE "iconsiam_awards" DROP COLUMN "call_to_action_link";
  ALTER TABLE "iconsiam_awards_locales" DROP COLUMN "call_to_action_text";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "iconsiam_awards" ADD COLUMN "banner_image_id" integer;
  ALTER TABLE "iconsiam_awards" ADD COLUMN "call_to_action_link" varchar;
  ALTER TABLE "iconsiam_awards_locales" ADD COLUMN "call_to_action_text" varchar DEFAULT 'Discover More';
  ALTER TABLE "iconsiam_awards" ADD CONSTRAINT "iconsiam_awards_banner_image_id_media_id_fk" FOREIGN KEY ("banner_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "iconsiam_awards_banner_image_idx" ON "iconsiam_awards" USING btree ("banner_image_id");`)
}
