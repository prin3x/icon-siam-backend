import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "attractions" ADD COLUMN "showcase_background_color" varchar DEFAULT '#000000';
  ALTER TABLE "attractions_locales" ADD COLUMN "showcase_subtitle" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "attractions" DROP COLUMN IF EXISTS "showcase_background_color";
  ALTER TABLE "attractions_locales" DROP COLUMN IF EXISTS "showcase_subtitle";`)
}
