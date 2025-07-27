import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "facilities_services" DROP CONSTRAINT "facilities_services_floor_id_floors_id_fk";
  
  ALTER TABLE "facilities_facilities" DROP CONSTRAINT "facilities_facilities_floor_id_floors_id_fk";
  
  DROP INDEX "facilities_services_floor_idx";
  DROP INDEX "facilities_facilities_floor_idx";
  ALTER TABLE "facilities_rels" ADD COLUMN "floors_id" integer;
  ALTER TABLE "facilities_rels" ADD CONSTRAINT "facilities_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "facilities_rels_floors_id_idx" ON "facilities_rels" USING btree ("floors_id");
  ALTER TABLE "facilities_services" DROP COLUMN "floor_id";
  ALTER TABLE "facilities_facilities" DROP COLUMN "floor_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "facilities_rels" DROP CONSTRAINT "facilities_rels_floors_fk";
  
  DROP INDEX "facilities_rels_floors_id_idx";
  ALTER TABLE "facilities_services" ADD COLUMN "floor_id" integer;
  ALTER TABLE "facilities_facilities" ADD COLUMN "floor_id" integer;
  ALTER TABLE "facilities_services" ADD CONSTRAINT "facilities_services_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "facilities_facilities" ADD CONSTRAINT "facilities_facilities_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "facilities_services_floor_idx" ON "facilities_services" USING btree ("floor_id");
  CREATE INDEX "facilities_facilities_floor_idx" ON "facilities_facilities" USING btree ("floor_id");
  ALTER TABLE "facilities_rels" DROP COLUMN "floors_id";`)
}
