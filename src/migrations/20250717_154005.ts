import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_api_sync_logs_unmapped_data_unmapped_categories_type" AS ENUM('shops', 'dinings');
  CREATE TYPE "public"."enum_api_sync_logs_status" AS ENUM('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL');
  CREATE TABLE "api_sync_logs_validation_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"record_unique_id" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "api_sync_logs_unmapped_data_unmapped_floors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"floor_name" varchar
  );
  
  CREATE TABLE "api_sync_logs_unmapped_data_unmapped_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category_name" varchar,
  	"type" "enum_api_sync_logs_unmapped_data_unmapped_categories_type",
  	"english_name" varchar,
  	"thai_name" varchar
  );
  
  CREATE TABLE "api_sync_logs_errors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"timestamp" timestamp(3) with time zone,
  	"record_unique_id" varchar,
  	"error_message" varchar,
  	"error_stack" varchar
  );
  
  CREATE TABLE "api_sync_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sync_id" varchar NOT NULL,
  	"status" "enum_api_sync_logs_status" DEFAULT 'RUNNING' NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone,
  	"duration_seconds" numeric,
  	"external_api_url" varchar NOT NULL,
  	"api_response_summary_total_records_fetched" numeric DEFAULT 0,
  	"api_response_summary_total_pages" numeric DEFAULT 0,
  	"api_response_summary_last_page_processed" numeric DEFAULT 0,
  	"processing_summary_records_processed" numeric DEFAULT 0,
  	"processing_summary_records_created" numeric DEFAULT 0,
  	"processing_summary_records_updated" numeric DEFAULT 0,
  	"processing_summary_records_failed" numeric DEFAULT 0,
  	"processing_summary_shops_processed" numeric DEFAULT 0,
  	"processing_summary_dinings_processed" numeric DEFAULT 0,
  	"performance_metrics_avg_time_per_record" numeric,
  	"performance_metrics_memory_usage_mb" numeric,
  	"performance_metrics_api_response_time_avg" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "api_sync_logs_id" integer;
  ALTER TABLE "api_sync_logs_validation_issues" ADD CONSTRAINT "api_sync_logs_validation_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."api_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "api_sync_logs_unmapped_data_unmapped_floors" ADD CONSTRAINT "api_sync_logs_unmapped_data_unmapped_floors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."api_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "api_sync_logs_unmapped_data_unmapped_categories" ADD CONSTRAINT "api_sync_logs_unmapped_data_unmapped_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."api_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "api_sync_logs_errors" ADD CONSTRAINT "api_sync_logs_errors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."api_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "api_sync_logs_validation_issues_order_idx" ON "api_sync_logs_validation_issues" USING btree ("_order");
  CREATE INDEX "api_sync_logs_validation_issues_parent_id_idx" ON "api_sync_logs_validation_issues" USING btree ("_parent_id");
  CREATE INDEX "api_sync_logs_unmapped_data_unmapped_floors_order_idx" ON "api_sync_logs_unmapped_data_unmapped_floors" USING btree ("_order");
  CREATE INDEX "api_sync_logs_unmapped_data_unmapped_floors_parent_id_idx" ON "api_sync_logs_unmapped_data_unmapped_floors" USING btree ("_parent_id");
  CREATE INDEX "api_sync_logs_unmapped_data_unmapped_categories_order_idx" ON "api_sync_logs_unmapped_data_unmapped_categories" USING btree ("_order");
  CREATE INDEX "api_sync_logs_unmapped_data_unmapped_categories_parent_id_idx" ON "api_sync_logs_unmapped_data_unmapped_categories" USING btree ("_parent_id");
  CREATE INDEX "api_sync_logs_errors_order_idx" ON "api_sync_logs_errors" USING btree ("_order");
  CREATE INDEX "api_sync_logs_errors_parent_id_idx" ON "api_sync_logs_errors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "api_sync_logs_sync_id_idx" ON "api_sync_logs" USING btree ("sync_id");
  CREATE INDEX "api_sync_logs_updated_at_idx" ON "api_sync_logs" USING btree ("updated_at");
  CREATE INDEX "api_sync_logs_created_at_idx" ON "api_sync_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_api_sync_logs_fk" FOREIGN KEY ("api_sync_logs_id") REFERENCES "public"."api_sync_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_api_sync_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("api_sync_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "api_sync_logs_validation_issues" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "api_sync_logs_unmapped_data_unmapped_floors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "api_sync_logs_unmapped_data_unmapped_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "api_sync_logs_errors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "api_sync_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "api_sync_logs_validation_issues" CASCADE;
  DROP TABLE "api_sync_logs_unmapped_data_unmapped_floors" CASCADE;
  DROP TABLE "api_sync_logs_unmapped_data_unmapped_categories" CASCADE;
  DROP TABLE "api_sync_logs_errors" CASCADE;
  DROP TABLE "api_sync_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_api_sync_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_api_sync_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "api_sync_logs_id";
  DROP TYPE "public"."enum_api_sync_logs_unmapped_data_unmapped_categories_type";
  DROP TYPE "public"."enum_api_sync_logs_status";`)
}
