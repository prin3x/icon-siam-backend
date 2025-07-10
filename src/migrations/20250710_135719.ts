import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_getting_here_explore_icon_siam_placement_key" AS ENUM('HOMEPAGE', 'ABOUT', 'DINING', 'SHOPPING', 'EVENTS', 'PROMOTIONS', 'GETTING_HERE', 'DIRECTORY', 'ICON_CRAFT', 'ICON_LUXE', 'ATTRACTION', 'NEWS', 'STORIES', 'FACILITIES', 'RESIDENCES', 'TENANT_SERVICES', 'VISION_AND_MISSION', 'BOARD_OF_DIRECTORS', 'AWARDS');
  CREATE TABLE "getting_here_explore_icon_siam" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"placement_key" "enum_getting_here_explore_icon_siam_placement_key" NOT NULL,
  	"image_id" integer
  );
  
  ALTER TABLE "getting_here_explore_icon_siam" ADD CONSTRAINT "getting_here_explore_icon_siam_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "getting_here_explore_icon_siam" ADD CONSTRAINT "getting_here_explore_icon_siam_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "getting_here_explore_icon_siam_order_idx" ON "getting_here_explore_icon_siam" USING btree ("_order");
  CREATE INDEX "getting_here_explore_icon_siam_parent_id_idx" ON "getting_here_explore_icon_siam" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "getting_here_explore_icon_siam_placement_key_idx" ON "getting_here_explore_icon_siam" USING btree ("placement_key");
  CREATE INDEX "getting_here_explore_icon_siam_image_idx" ON "getting_here_explore_icon_siam" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "getting_here_explore_icon_siam" CASCADE;
  DROP TYPE "public"."enum_getting_here_explore_icon_siam_placement_key";`)
}
