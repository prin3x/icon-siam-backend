import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "about_iconsiam" ADD COLUMN "vision_mission_background_color" varchar DEFAULT '#2B2B28';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "about_iconsiam" DROP COLUMN "vision_mission_background_color";`)
}
