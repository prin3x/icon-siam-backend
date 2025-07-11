import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" ADD COLUMN "pin_to_iconluxe" boolean DEFAULT false;
  ALTER TABLE "dinings" ADD COLUMN "pin_to_iconluxe" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shops" DROP COLUMN "pin_to_iconluxe";
  ALTER TABLE "dinings" DROP COLUMN "pin_to_iconluxe";`)
}
