import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add new columns to promotions_locales
  await db.execute(sql`
    ALTER TABLE "promotions_locales" ADD COLUMN "images_cover_photo_id" integer;
    ALTER TABLE "promotions_locales" ADD COLUMN "images_thumbnail_id" integer;
    ALTER TABLE "promotions_locales" ADD COLUMN "images_facebook_image_id" integer;
  `)

  // Step 2: Add foreign key constraints
  await db.execute(sql`
    ALTER TABLE "promotions_locales" ADD CONSTRAINT "promotions_locales_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "promotions_locales" ADD CONSTRAINT "promotions_locales_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "promotions_locales" ADD CONSTRAINT "promotions_locales_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  `)

  // Step 3: Drop existing indexes if they exist, then create new ones
  await db.execute(sql`
    DROP INDEX IF EXISTS "promotions_images_images_cover_photo_idx";
    DROP INDEX IF EXISTS "promotions_images_images_thumbnail_idx";
    DROP INDEX IF EXISTS "promotions_images_images_facebook_image_idx";
  `)

  await db.execute(sql`
    CREATE INDEX "promotions_images_images_cover_photo_idx" ON "promotions_locales" USING btree ("images_cover_photo_id","_locale");
    CREATE INDEX "promotions_images_images_thumbnail_idx" ON "promotions_locales" USING btree ("images_thumbnail_id","_locale");
    CREATE INDEX "promotions_images_images_facebook_image_idx" ON "promotions_locales" USING btree ("images_facebook_image_id","_locale");
  `)

  // Step 4: Preserve existing images by copying from promotions to promotions_locales
  await db.execute(sql`
    UPDATE promotions_locales 
    SET 
      images_cover_photo_id = (
        SELECT p.images_cover_photo_id 
        FROM promotions p 
        WHERE p.id = promotions_locales._parent_id 
        AND p.images_cover_photo_id IS NOT NULL
      ),
      images_thumbnail_id = (
        SELECT p.images_thumbnail_id 
        FROM promotions p 
        WHERE p.id = promotions_locales._parent_id 
        AND p.images_thumbnail_id IS NOT NULL
      ),
      images_facebook_image_id = (
        SELECT p.images_facebook_image_id 
        FROM promotions p 
        WHERE p.id = promotions_locales._parent_id 
        AND p.images_facebook_image_id IS NOT NULL
      )
    WHERE EXISTS (
      SELECT 1 FROM promotions p 
      WHERE p.id = promotions_locales._parent_id
      AND (
        p.images_cover_photo_id IS NOT NULL OR 
        p.images_thumbnail_id IS NOT NULL OR 
        p.images_facebook_image_id IS NOT NULL
      )
    )
  `)

  // Step 5: Drop constraints from promotions table
  await db.execute(sql`
    ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_cover_photo_id_media_id_fk";
    ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_thumbnail_id_media_id_fk";
    ALTER TABLE "promotions" DROP CONSTRAINT "promotions_images_facebook_image_id_media_id_fk";
  `)

  // Step 6: Drop indexes from promotions table
  await db.execute(sql`
    DROP INDEX "promotions_images_images_cover_photo_idx";
    DROP INDEX "promotions_images_images_thumbnail_idx";
    DROP INDEX "promotions_images_images_facebook_image_idx";
  `)

  // Step 7: Drop old columns from promotions table
  await db.execute(sql`
    ALTER TABLE "promotions" DROP COLUMN "images_cover_photo_id";
    ALTER TABLE "promotions" DROP COLUMN "images_thumbnail_id";
    ALTER TABLE "promotions" DROP COLUMN "images_facebook_image_id";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Step 1: Add columns back to promotions table
  await db.execute(sql`
    ALTER TABLE "promotions" ADD COLUMN "images_cover_photo_id" integer;
    ALTER TABLE "promotions" ADD COLUMN "images_thumbnail_id" integer;
    ALTER TABLE "promotions" ADD COLUMN "images_facebook_image_id" integer;
  `)

  // Step 2: Add constraints back to promotions table
  await db.execute(sql`
    ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_cover_photo_id_media_id_fk" FOREIGN KEY ("images_cover_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_thumbnail_id_media_id_fk" FOREIGN KEY ("images_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "promotions" ADD CONSTRAINT "promotions_images_facebook_image_id_media_id_fk" FOREIGN KEY ("images_facebook_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  `)

  // Step 3: Create indexes back on promotions table
  await db.execute(sql`
    CREATE INDEX "promotions_images_images_cover_photo_idx" ON "promotions" USING btree ("images_cover_photo_id");
    CREATE INDEX "promotions_images_images_thumbnail_idx" ON "promotions" USING btree ("images_thumbnail_id");
    CREATE INDEX "promotions_images_images_facebook_image_idx" ON "promotions" USING btree ("images_facebook_image_id");
  `)

  // Step 4: Restore images from promotions_locales back to promotions table
  await db.execute(sql`
    UPDATE promotions 
    SET 
      images_cover_photo_id = (
        SELECT pl.images_cover_photo_id 
        FROM promotions_locales pl 
        WHERE pl._parent_id = promotions.id 
        AND pl._locale = 'th'
        AND pl.images_cover_photo_id IS NOT NULL
        LIMIT 1
      ),
      images_thumbnail_id = (
        SELECT pl.images_thumbnail_id 
        FROM promotions_locales pl 
        WHERE pl._parent_id = promotions.id 
        AND pl._locale = 'th'
        AND pl.images_thumbnail_id IS NOT NULL
        LIMIT 1
      ),
      images_facebook_image_id = (
        SELECT pl.images_facebook_image_id 
        FROM promotions_locales pl 
        WHERE pl._parent_id = promotions.id 
        AND pl._locale = 'th'
        AND pl.images_facebook_image_id IS NOT NULL
        LIMIT 1
      )
    WHERE EXISTS (
      SELECT 1 FROM promotions_locales pl 
      WHERE pl._parent_id = promotions.id
      AND pl._locale = 'th'
      AND (
        pl.images_cover_photo_id IS NOT NULL OR 
        pl.images_thumbnail_id IS NOT NULL OR 
        pl.images_facebook_image_id IS NOT NULL
      )
    )
  `)

  // Step 5: Drop constraints from promotions_locales table
  await db.execute(sql`
    ALTER TABLE "promotions_locales" DROP CONSTRAINT "promotions_locales_images_cover_photo_id_media_id_fk";
    ALTER TABLE "promotions_locales" DROP CONSTRAINT "promotions_locales_images_thumbnail_id_media_id_fk";
    ALTER TABLE "promotions_locales" DROP CONSTRAINT "promotions_locales_images_facebook_image_id_media_id_fk";
  `)

  // Step 6: Drop indexes from promotions_locales table
  await db.execute(sql`
    DROP INDEX "promotions_images_images_cover_photo_idx";
    DROP INDEX "promotions_images_images_thumbnail_idx";
    DROP INDEX "promotions_images_images_facebook_image_idx";
  `)

  // Step 7: Drop columns from promotions_locales table
  await db.execute(sql`
    ALTER TABLE "promotions_locales" DROP COLUMN "images_cover_photo_id";
    ALTER TABLE "promotions_locales" DROP COLUMN "images_thumbnail_id";
    ALTER TABLE "promotions_locales" DROP COLUMN "images_facebook_image_id";
  `)
}
