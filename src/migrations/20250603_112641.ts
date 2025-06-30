import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('th', 'en', 'zh');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_page_banners_placement_key" AS ENUM('HOMEPAGE', 'ABOUT', 'DINING', 'SHOPPING', 'EVENTS', 'PROMOTIONS', 'GETTING_HERE', 'DIRECTORY', 'ICON_CRAFT', 'ICON_LUXE', 'ATTRACTION', 'NEWS', 'STORIES', 'FACILITIES', 'RESIDENCES', 'TENANT_SERVICES', 'VISION_AND_MISSION', 'BOARD_OF_DIRECTORS', 'AWARDS');
  CREATE TYPE "public"."enum_events_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_shops_opening_hours_per_day_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_shops_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED');
  CREATE TYPE "public"."enum_dinings_opening_hours_per_day_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_dinings_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED');
  CREATE TYPE "public"."enum_attractions_status" AS ENUM('ACTIVE', 'INACTIVE', 'CLOSED', 'TEMPORARILY_CLOSED');
  CREATE TYPE "public"."enum_icon_craft_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_icon_luxe_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_getting_here_opening_hours_per_day_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_getting_here_methods_type" AS ENUM('car', 'bts', 'bus', 'boat', 'hotel_boat', 'shuttle_boat');
  CREATE TYPE "public"."enum_categories_type" AS ENUM('shops', 'dinings', 'promotions', 'events', 'directory');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_gallery_collections_placement_key" AS ENUM('HOMEPAGE', 'ABOUT', 'DINING', 'SHOPPING', 'EVENTS', 'GETTING_HERE', 'DIRECTORY', 'ICON_CRAFT', 'ICON_LUXE', 'ATTRACTION', 'NEWS', 'STORIES', 'FACILITIES', 'RESIDENCES', 'TENANT_SERVICES', 'VISION_AND_MISSION', 'BOARD_OF_DIRECTORS', 'AWARDS');
  CREATE TYPE "public"."enum_promotions_status" AS ENUM('ACTIVE', 'INACTIVE');
  CREATE TYPE "public"."enum_promotions_type" AS ENUM('event', 'attraction', 'dining', 'shop');
  CREATE TABLE IF NOT EXISTS "homepage_happening" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"event_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_iconic_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"custom_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_iconic_experience_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_dinings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"dining_id" integer,
  	"custom_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_dinings_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_shops" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"custom_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_shops_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"showcase_background_image_id" integer,
  	"onesiam_member_image_id" integer,
  	"onesiam_app_image_id" integer,
  	"onesiam_app_call_to_action_android_link" varchar,
  	"onesiam_app_call_to_action_ios_link" varchar,
  	"status" "enum_homepage_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"custom_happening_title" varchar,
  	"custom_happening_subtitle" varchar,
  	"custom_iconic_experience_title" varchar,
  	"custom_iconic_experience_subtitle" varchar,
  	"custom_dinings_title" varchar,
  	"custom_dinings_subtitle" varchar,
  	"custom_shops_title" varchar,
  	"custom_shops_subtitle" varchar,
  	"showcase_title" varchar,
  	"showcase_description" varchar,
  	"showcase_call_to_action" varchar,
  	"showcase_link" varchar,
  	"onesiam_member_title" varchar,
  	"onesiam_member_description" varchar,
  	"onesiam_member_call_to_action" varchar,
  	"onesiam_member_link" varchar,
  	"onesiam_app_title" varchar,
  	"onesiam_app_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"dinings_id" integer,
  	"shops_id" integer,
  	"attractions_id" integer,
  	"icon_luxe_id" integer,
  	"icon_craft_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "page_banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"placement_key" "enum_page_banners_placement_key" NOT NULL,
  	"display_order" numeric DEFAULT 0,
  	"linked_event_id" integer,
  	"custom_image_url_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "page_banners_locales" (
  	"custom_title" varchar,
  	"custom_subtitle" varchar,
  	"first_section_title" varchar,
  	"first_section_subtitle" varchar,
  	"custom_image_alt_text" varchar,
  	"call_to_action_text" varchar,
  	"target_url" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_events_status" DEFAULT 'ACTIVE' NOT NULL,
  	"image_url_id" integer,
  	"thumbnail_url" varchar,
  	"location_name" varchar,
  	"location_address" varchar,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "shops_opening_hours_per_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_shops_opening_hours_per_day_day",
  	"open" varchar,
  	"close" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "shops_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "shops_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "shops" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"floor_id" integer,
  	"location_zone" varchar,
  	"opening_hours_same_hours_every_day" boolean DEFAULT true,
  	"opening_hours_open" varchar,
  	"opening_hours_close" varchar,
  	"contact_website" varchar,
  	"contact_phone" varchar,
  	"logo_image_url_id" integer,
  	"main_image_url_id" integer,
  	"status" "enum_shops_status" DEFAULT 'ACTIVE' NOT NULL,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "shops_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"location_shop_number" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "shops_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_opening_hours_per_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_dinings_opening_hours_per_day_day",
  	"open" varchar,
  	"close" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "dinings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"floor_id" integer,
  	"location_zone" varchar,
  	"opening_hours_same_hours_every_day" boolean DEFAULT true,
  	"opening_hours_open" varchar,
  	"opening_hours_close" varchar,
  	"contact_website" varchar,
  	"contact_phone" varchar,
  	"logo_image_url_id" integer,
  	"main_image_url_id" integer,
  	"status" "enum_dinings_status" DEFAULT 'ACTIVE' NOT NULL,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"location_shop_number" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "dinings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "attractions_highlight_image_url" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "attractions_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "attractions_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "attractions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"main_image_url_id" integer,
  	"feature_image_url_id" integer,
  	"showcase_image_url_id" integer,
  	"gallery_main_image_url_id" integer,
  	"status" "enum_attractions_status" DEFAULT 'ACTIVE' NOT NULL,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "attractions_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"feature_title" varchar,
  	"feature_description" varchar,
  	"showcase_title" varchar,
  	"showcase_description" varchar,
  	"gallery_title" varchar,
  	"gallery_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "icon_craft_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "icon_craft_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "icon_craft_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "icon_craft" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"main_image_url_id" integer,
  	"status" "enum_icon_craft_status" DEFAULT 'ACTIVE' NOT NULL,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "icon_craft_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"showcase_title" varchar,
  	"showcase_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "icon_luxe_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "icon_luxe_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "icon_luxe" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"main_image_url_id" integer,
  	"highlight_image_url_id" integer,
  	"status" "enum_icon_luxe_status" DEFAULT 'ACTIVE' NOT NULL,
  	"is_featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "icon_luxe_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"highlight_title" varchar,
  	"highlight_description" varchar,
  	"showcase_title" varchar,
  	"showcase_description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "getting_here_opening_hours_per_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_getting_here_opening_hours_per_day_day",
  	"open" varchar,
  	"close" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "getting_here_methods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_getting_here_methods_type" NOT NULL,
  	"icon_id" integer,
  	"title" varchar,
  	"details" jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "getting_here" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Getting Here',
  	"custom_image_url_id" integer,
  	"location" varchar,
  	"contact" varchar,
  	"contact_info" varchar,
  	"opening_hours_same_hours_every_day" boolean DEFAULT true,
  	"opening_hours_open" varchar,
  	"opening_hours_close" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "directory_icon_siam_picks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"custom_image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "directory_icon_siam_picks_locales" (
  	"custom_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "directory" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "directory_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"shops_id" integer,
  	"dinings_id" integer,
  	"attractions_id" integer,
  	"icon_luxe_id" integer,
  	"icon_craft_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "floors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt_en" varchar,
  	"alt_th" varchar,
  	"alt_zh" varchar,
  	"prefix" varchar DEFAULT 'media',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"type" "enum_categories_type" NOT NULL,
  	"order" numeric DEFAULT 0,
  	"status" "enum_categories_status" DEFAULT 'ACTIVE' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "categories_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_collections_gallery_image_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_url_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"placement_key" "enum_gallery_collections_placement_key" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "gallery_collections_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "promotions_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "promotions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"main_image_url_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_promotions_status" DEFAULT 'ACTIVE' NOT NULL,
  	"thumbnail_url" varchar,
  	"location_name" varchar,
  	"location_address" varchar,
  	"is_featured" boolean,
  	"type" "enum_promotions_type",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "promotions_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "promotions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"homepage_id" integer,
  	"page_banners_id" integer,
  	"events_id" integer,
  	"shops_id" integer,
  	"dinings_id" integer,
  	"attractions_id" integer,
  	"icon_craft_id" integer,
  	"icon_luxe_id" integer,
  	"getting_here_id" integer,
  	"directory_id" integer,
  	"floors_id" integer,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"gallery_collections_id" integer,
  	"promotions_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  DO $$ BEGIN
   ALTER TABLE "homepage_iconic_experience" ADD CONSTRAINT "homepage_iconic_experience_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_iconic_experience" ADD CONSTRAINT "homepage_iconic_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_iconic_experience_locales" ADD CONSTRAINT "homepage_iconic_experience_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_iconic_experience"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_dinings" ADD CONSTRAINT "homepage_dinings_dining_id_dinings_id_fk" FOREIGN KEY ("dining_id") REFERENCES "public"."dinings"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_dinings" ADD CONSTRAINT "homepage_dinings_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_dinings" ADD CONSTRAINT "homepage_dinings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_dinings_locales" ADD CONSTRAINT "homepage_dinings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_shops" ADD CONSTRAINT "homepage_shops_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_shops" ADD CONSTRAINT "homepage_shops_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_shops_locales" ADD CONSTRAINT "homepage_shops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage" ADD CONSTRAINT "homepage_showcase_background_image_id_media_id_fk" FOREIGN KEY ("showcase_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage" ADD CONSTRAINT "homepage_onesiam_member_image_id_media_id_fk" FOREIGN KEY ("onesiam_member_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage" ADD CONSTRAINT "homepage_onesiam_app_image_id_media_id_fk" FOREIGN KEY ("onesiam_app_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_icon_luxe_fk" FOREIGN KEY ("icon_luxe_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_icon_craft_fk" FOREIGN KEY ("icon_craft_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_linked_event_id_events_id_fk" FOREIGN KEY ("linked_event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "page_banners" ADD CONSTRAINT "page_banners_custom_image_url_id_media_id_fk" FOREIGN KEY ("custom_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "page_banners_locales" ADD CONSTRAINT "page_banners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_banners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_keywords" ADD CONSTRAINT "events_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_opening_hours_per_day" ADD CONSTRAINT "shops_opening_hours_per_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_gallery_image_urls" ADD CONSTRAINT "shops_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_gallery_image_urls" ADD CONSTRAINT "shops_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_keywords" ADD CONSTRAINT "shops_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_logo_image_url_id_media_id_fk" FOREIGN KEY ("logo_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops" ADD CONSTRAINT "shops_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_locales" ADD CONSTRAINT "shops_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_rels" ADD CONSTRAINT "shops_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "shops_rels" ADD CONSTRAINT "shops_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_opening_hours_per_day" ADD CONSTRAINT "dinings_opening_hours_per_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_gallery_image_urls" ADD CONSTRAINT "dinings_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_gallery_image_urls" ADD CONSTRAINT "dinings_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_keywords" ADD CONSTRAINT "dinings_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_logo_image_url_id_media_id_fk" FOREIGN KEY ("logo_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings" ADD CONSTRAINT "dinings_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_locales" ADD CONSTRAINT "dinings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_rels" ADD CONSTRAINT "dinings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "dinings_rels" ADD CONSTRAINT "dinings_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_highlight_image_url" ADD CONSTRAINT "attractions_highlight_image_url_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_highlight_image_url" ADD CONSTRAINT "attractions_highlight_image_url_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_gallery_image_urls" ADD CONSTRAINT "attractions_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_gallery_image_urls" ADD CONSTRAINT "attractions_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_keywords" ADD CONSTRAINT "attractions_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions" ADD CONSTRAINT "attractions_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions" ADD CONSTRAINT "attractions_feature_image_url_id_media_id_fk" FOREIGN KEY ("feature_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions" ADD CONSTRAINT "attractions_showcase_image_url_id_media_id_fk" FOREIGN KEY ("showcase_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions" ADD CONSTRAINT "attractions_gallery_main_image_url_id_media_id_fk" FOREIGN KEY ("gallery_main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "attractions_locales" ADD CONSTRAINT "attractions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_content" ADD CONSTRAINT "icon_craft_content_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_content" ADD CONSTRAINT "icon_craft_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_gallery_image_urls" ADD CONSTRAINT "icon_craft_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_gallery_image_urls" ADD CONSTRAINT "icon_craft_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_keywords" ADD CONSTRAINT "icon_craft_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft" ADD CONSTRAINT "icon_craft_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_craft_locales" ADD CONSTRAINT "icon_craft_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe_gallery_image_urls" ADD CONSTRAINT "icon_luxe_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe_gallery_image_urls" ADD CONSTRAINT "icon_luxe_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe_keywords" ADD CONSTRAINT "icon_luxe_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe" ADD CONSTRAINT "icon_luxe_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe" ADD CONSTRAINT "icon_luxe_highlight_image_url_id_media_id_fk" FOREIGN KEY ("highlight_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "icon_luxe_locales" ADD CONSTRAINT "icon_luxe_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "getting_here_opening_hours_per_day" ADD CONSTRAINT "getting_here_opening_hours_per_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "getting_here_methods" ADD CONSTRAINT "getting_here_methods_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "getting_here_methods" ADD CONSTRAINT "getting_here_methods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."getting_here"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "getting_here" ADD CONSTRAINT "getting_here_custom_image_url_id_media_id_fk" FOREIGN KEY ("custom_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_icon_siam_picks" ADD CONSTRAINT "directory_icon_siam_picks_custom_image_id_media_id_fk" FOREIGN KEY ("custom_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_icon_siam_picks" ADD CONSTRAINT "directory_icon_siam_picks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directory"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_icon_siam_picks_locales" ADD CONSTRAINT "directory_icon_siam_picks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directory_icon_siam_picks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."directory"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_icon_luxe_fk" FOREIGN KEY ("icon_luxe_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "directory_rels" ADD CONSTRAINT "directory_rels_icon_craft_fk" FOREIGN KEY ("icon_craft_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gallery_collections_gallery_image_urls" ADD CONSTRAINT "gallery_collections_gallery_image_urls_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gallery_collections_gallery_image_urls" ADD CONSTRAINT "gallery_collections_gallery_image_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_collections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "gallery_collections_locales" ADD CONSTRAINT "gallery_collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_collections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_keywords" ADD CONSTRAINT "promotions_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions" ADD CONSTRAINT "promotions_main_image_url_id_media_id_fk" FOREIGN KEY ("main_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_locales" ADD CONSTRAINT "promotions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "promotions_rels" ADD CONSTRAINT "promotions_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_homepage_fk" FOREIGN KEY ("homepage_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_banners_fk" FOREIGN KEY ("page_banners_id") REFERENCES "public"."page_banners"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shops_fk" FOREIGN KEY ("shops_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_dinings_fk" FOREIGN KEY ("dinings_id") REFERENCES "public"."dinings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_attractions_fk" FOREIGN KEY ("attractions_id") REFERENCES "public"."attractions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_icon_craft_fk" FOREIGN KEY ("icon_craft_id") REFERENCES "public"."icon_craft"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_icon_luxe_fk" FOREIGN KEY ("icon_luxe_id") REFERENCES "public"."icon_luxe"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_getting_here_fk" FOREIGN KEY ("getting_here_id") REFERENCES "public"."getting_here"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_directory_fk" FOREIGN KEY ("directory_id") REFERENCES "public"."directory"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_collections_fk" FOREIGN KEY ("gallery_collections_id") REFERENCES "public"."gallery_collections"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_promotions_fk" FOREIGN KEY ("promotions_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "homepage_happening_order_idx" ON "homepage_happening" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_happening_parent_id_idx" ON "homepage_happening" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_happening_event_idx" ON "homepage_happening" USING btree ("event_id");
  CREATE INDEX IF NOT EXISTS "homepage_iconic_experience_order_idx" ON "homepage_iconic_experience" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_iconic_experience_parent_id_idx" ON "homepage_iconic_experience" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_iconic_experience_custom_image_idx" ON "homepage_iconic_experience" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_iconic_experience_locales_locale_parent_id_unique" ON "homepage_iconic_experience_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_dinings_order_idx" ON "homepage_dinings" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_dinings_parent_id_idx" ON "homepage_dinings" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_dinings_dining_idx" ON "homepage_dinings" USING btree ("dining_id");
  CREATE INDEX IF NOT EXISTS "homepage_dinings_custom_image_idx" ON "homepage_dinings" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_dinings_locales_locale_parent_id_unique" ON "homepage_dinings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_shops_order_idx" ON "homepage_shops" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "homepage_shops_parent_id_idx" ON "homepage_shops" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_shops_custom_image_idx" ON "homepage_shops" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_shops_locales_locale_parent_id_unique" ON "homepage_shops_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_showcase_background_image_idx" ON "homepage" USING btree ("showcase_background_image_id");
  CREATE INDEX IF NOT EXISTS "homepage_onesiam_member_image_idx" ON "homepage" USING btree ("onesiam_member_image_id");
  CREATE INDEX IF NOT EXISTS "homepage_onesiam_app_image_idx" ON "homepage" USING btree ("onesiam_app_image_id");
  CREATE INDEX IF NOT EXISTS "homepage_updated_at_idx" ON "homepage" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "homepage_created_at_idx" ON "homepage" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "homepage_rels_dinings_id_idx" ON "homepage_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_shops_id_idx" ON "homepage_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_attractions_id_idx" ON "homepage_rels" USING btree ("attractions_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_icon_luxe_id_idx" ON "homepage_rels" USING btree ("icon_luxe_id");
  CREATE INDEX IF NOT EXISTS "homepage_rels_icon_craft_id_idx" ON "homepage_rels" USING btree ("icon_craft_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "page_banners_placement_key_idx" ON "page_banners" USING btree ("placement_key");
  CREATE INDEX IF NOT EXISTS "page_banners_linked_event_idx" ON "page_banners" USING btree ("linked_event_id");
  CREATE INDEX IF NOT EXISTS "page_banners_custom_image_url_idx" ON "page_banners" USING btree ("custom_image_url_id");
  CREATE INDEX IF NOT EXISTS "page_banners_updated_at_idx" ON "page_banners" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "page_banners_created_at_idx" ON "page_banners" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "page_banners_locales_locale_parent_id_unique" ON "page_banners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "events_keywords_order_idx" ON "events_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_keywords_parent_id_idx" ON "events_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_keywords_locale_idx" ON "events_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "events_image_url_idx" ON "events" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "events_rels_categories_id_idx" ON "events_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "shops_opening_hours_per_day_order_idx" ON "shops_opening_hours_per_day" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_opening_hours_per_day_parent_id_idx" ON "shops_opening_hours_per_day" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_order_idx" ON "shops_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_parent_id_idx" ON "shops_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_gallery_image_urls_image_url_idx" ON "shops_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "shops_keywords_order_idx" ON "shops_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "shops_keywords_parent_id_idx" ON "shops_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_keywords_locale_idx" ON "shops_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "shops_floor_idx" ON "shops" USING btree ("floor_id");
  CREATE INDEX IF NOT EXISTS "shops_logo_image_url_idx" ON "shops" USING btree ("logo_image_url_id");
  CREATE INDEX IF NOT EXISTS "shops_main_image_url_idx" ON "shops" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "shops_updated_at_idx" ON "shops" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "shops_created_at_idx" ON "shops" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "shops_slug_idx" ON "shops_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "shops_locales_locale_parent_id_unique" ON "shops_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "shops_rels_order_idx" ON "shops_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "shops_rels_parent_idx" ON "shops_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "shops_rels_path_idx" ON "shops_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "shops_rels_categories_id_idx" ON "shops_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "dinings_opening_hours_per_day_order_idx" ON "dinings_opening_hours_per_day" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_opening_hours_per_day_parent_id_idx" ON "dinings_opening_hours_per_day" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_order_idx" ON "dinings_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_parent_id_idx" ON "dinings_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_gallery_image_urls_image_url_idx" ON "dinings_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_keywords_order_idx" ON "dinings_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "dinings_keywords_parent_id_idx" ON "dinings_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_keywords_locale_idx" ON "dinings_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "dinings_floor_idx" ON "dinings" USING btree ("floor_id");
  CREATE INDEX IF NOT EXISTS "dinings_logo_image_url_idx" ON "dinings" USING btree ("logo_image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_main_image_url_idx" ON "dinings" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "dinings_updated_at_idx" ON "dinings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "dinings_created_at_idx" ON "dinings" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "dinings_slug_idx" ON "dinings_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "dinings_locales_locale_parent_id_unique" ON "dinings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_rels_order_idx" ON "dinings_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "dinings_rels_parent_idx" ON "dinings_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "dinings_rels_path_idx" ON "dinings_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "dinings_rels_categories_id_idx" ON "dinings_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "attractions_highlight_image_url_order_idx" ON "attractions_highlight_image_url" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "attractions_highlight_image_url_parent_id_idx" ON "attractions_highlight_image_url" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "attractions_highlight_image_url_image_url_idx" ON "attractions_highlight_image_url" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_gallery_image_urls_order_idx" ON "attractions_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "attractions_gallery_image_urls_parent_id_idx" ON "attractions_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "attractions_gallery_image_urls_image_url_idx" ON "attractions_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_keywords_order_idx" ON "attractions_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "attractions_keywords_parent_id_idx" ON "attractions_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "attractions_keywords_locale_idx" ON "attractions_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "attractions_main_image_url_idx" ON "attractions" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_feature_image_url_idx" ON "attractions" USING btree ("feature_image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_showcase_image_url_idx" ON "attractions" USING btree ("showcase_image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_gallery_main_image_url_idx" ON "attractions" USING btree ("gallery_main_image_url_id");
  CREATE INDEX IF NOT EXISTS "attractions_updated_at_idx" ON "attractions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "attractions_created_at_idx" ON "attractions" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "attractions_slug_idx" ON "attractions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "attractions_locales_locale_parent_id_unique" ON "attractions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_content_order_idx" ON "icon_craft_content" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "icon_craft_content_parent_id_idx" ON "icon_craft_content" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_content_image_url_idx" ON "icon_craft_content" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_gallery_image_urls_order_idx" ON "icon_craft_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "icon_craft_gallery_image_urls_parent_id_idx" ON "icon_craft_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_gallery_image_urls_image_url_idx" ON "icon_craft_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_keywords_order_idx" ON "icon_craft_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "icon_craft_keywords_parent_id_idx" ON "icon_craft_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_keywords_locale_idx" ON "icon_craft_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "icon_craft_main_image_url_idx" ON "icon_craft" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_craft_updated_at_idx" ON "icon_craft" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "icon_craft_created_at_idx" ON "icon_craft" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_craft_slug_idx" ON "icon_craft_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_craft_locales_locale_parent_id_unique" ON "icon_craft_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_gallery_image_urls_order_idx" ON "icon_luxe_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "icon_luxe_gallery_image_urls_parent_id_idx" ON "icon_luxe_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_gallery_image_urls_image_url_idx" ON "icon_luxe_gallery_image_urls" USING btree ("image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_keywords_order_idx" ON "icon_luxe_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "icon_luxe_keywords_parent_id_idx" ON "icon_luxe_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_keywords_locale_idx" ON "icon_luxe_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "icon_luxe_main_image_url_idx" ON "icon_luxe" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_highlight_image_url_idx" ON "icon_luxe" USING btree ("highlight_image_url_id");
  CREATE INDEX IF NOT EXISTS "icon_luxe_updated_at_idx" ON "icon_luxe" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "icon_luxe_created_at_idx" ON "icon_luxe" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_luxe_slug_idx" ON "icon_luxe_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "icon_luxe_locales_locale_parent_id_unique" ON "icon_luxe_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_here_opening_hours_per_day_order_idx" ON "getting_here_opening_hours_per_day" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_here_opening_hours_per_day_parent_id_idx" ON "getting_here_opening_hours_per_day" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_here_methods_order_idx" ON "getting_here_methods" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "getting_here_methods_parent_id_idx" ON "getting_here_methods" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "getting_here_methods_icon_idx" ON "getting_here_methods" USING btree ("icon_id");
  CREATE INDEX IF NOT EXISTS "getting_here_custom_image_url_idx" ON "getting_here" USING btree ("custom_image_url_id");
  CREATE INDEX IF NOT EXISTS "getting_here_updated_at_idx" ON "getting_here" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "getting_here_created_at_idx" ON "getting_here" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "directory_icon_siam_picks_order_idx" ON "directory_icon_siam_picks" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "directory_icon_siam_picks_parent_id_idx" ON "directory_icon_siam_picks" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "directory_icon_siam_picks_custom_image_idx" ON "directory_icon_siam_picks" USING btree ("custom_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "directory_icon_siam_picks_locales_locale_parent_id_unique" ON "directory_icon_siam_picks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "directory_updated_at_idx" ON "directory" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "directory_created_at_idx" ON "directory" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "directory_rels_order_idx" ON "directory_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "directory_rels_parent_idx" ON "directory_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "directory_rels_path_idx" ON "directory_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "directory_rels_shops_id_idx" ON "directory_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "directory_rels_dinings_id_idx" ON "directory_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "directory_rels_attractions_id_idx" ON "directory_rels" USING btree ("attractions_id");
  CREATE INDEX IF NOT EXISTS "directory_rels_icon_luxe_id_idx" ON "directory_rels" USING btree ("icon_luxe_id");
  CREATE INDEX IF NOT EXISTS "directory_rels_icon_craft_id_idx" ON "directory_rels" USING btree ("icon_craft_id");
  CREATE INDEX IF NOT EXISTS "floors_updated_at_idx" ON "floors" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "floors_created_at_idx" ON "floors" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX IF NOT EXISTS "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX IF NOT EXISTS "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_collections_gallery_image_urls_order_idx" ON "gallery_collections_gallery_image_urls" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "gallery_collections_gallery_image_urls_parent_id_idx" ON "gallery_collections_gallery_image_urls" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "gallery_collections_gallery_image_urls_image_url_idx" ON "gallery_collections_gallery_image_urls" USING btree ("image_url_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "gallery_collections_placement_key_idx" ON "gallery_collections" USING btree ("placement_key");
  CREATE INDEX IF NOT EXISTS "gallery_collections_updated_at_idx" ON "gallery_collections" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "gallery_collections_created_at_idx" ON "gallery_collections" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "gallery_collections_locales_locale_parent_id_unique" ON "gallery_collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "promotions_keywords_order_idx" ON "promotions_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "promotions_keywords_parent_id_idx" ON "promotions_keywords" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "promotions_keywords_locale_idx" ON "promotions_keywords" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "promotions_main_image_url_idx" ON "promotions" USING btree ("main_image_url_id");
  CREATE INDEX IF NOT EXISTS "promotions_updated_at_idx" ON "promotions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "promotions_created_at_idx" ON "promotions" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_slug_idx" ON "promotions_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "promotions_locales_locale_parent_id_unique" ON "promotions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_order_idx" ON "promotions_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "promotions_rels_parent_idx" ON "promotions_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "promotions_rels_path_idx" ON "promotions_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "promotions_rels_categories_id_idx" ON "promotions_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_homepage_id_idx" ON "payload_locked_documents_rels" USING btree ("homepage_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_page_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("page_banners_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_shops_id_idx" ON "payload_locked_documents_rels" USING btree ("shops_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_dinings_id_idx" ON "payload_locked_documents_rels" USING btree ("dinings_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_attractions_id_idx" ON "payload_locked_documents_rels" USING btree ("attractions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_icon_craft_id_idx" ON "payload_locked_documents_rels" USING btree ("icon_craft_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_icon_luxe_id_idx" ON "payload_locked_documents_rels" USING btree ("icon_luxe_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_getting_here_id_idx" ON "payload_locked_documents_rels" USING btree ("getting_here_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_directory_id_idx" ON "payload_locked_documents_rels" USING btree ("directory_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_floors_id_idx" ON "payload_locked_documents_rels" USING btree ("floors_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gallery_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_collections_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_promotions_id_idx" ON "payload_locked_documents_rels" USING btree ("promotions_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_happening" CASCADE;
  DROP TABLE "homepage_iconic_experience" CASCADE;
  DROP TABLE "homepage_iconic_experience_locales" CASCADE;
  DROP TABLE "homepage_dinings" CASCADE;
  DROP TABLE "homepage_dinings_locales" CASCADE;
  DROP TABLE "homepage_shops" CASCADE;
  DROP TABLE "homepage_shops_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "page_banners" CASCADE;
  DROP TABLE "page_banners_locales" CASCADE;
  DROP TABLE "events_keywords" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "shops_opening_hours_per_day" CASCADE;
  DROP TABLE "shops_gallery_image_urls" CASCADE;
  DROP TABLE "shops_keywords" CASCADE;
  DROP TABLE "shops" CASCADE;
  DROP TABLE "shops_locales" CASCADE;
  DROP TABLE "shops_rels" CASCADE;
  DROP TABLE "dinings_opening_hours_per_day" CASCADE;
  DROP TABLE "dinings_gallery_image_urls" CASCADE;
  DROP TABLE "dinings_keywords" CASCADE;
  DROP TABLE "dinings" CASCADE;
  DROP TABLE "dinings_locales" CASCADE;
  DROP TABLE "dinings_rels" CASCADE;
  DROP TABLE "attractions_highlight_image_url" CASCADE;
  DROP TABLE "attractions_gallery_image_urls" CASCADE;
  DROP TABLE "attractions_keywords" CASCADE;
  DROP TABLE "attractions" CASCADE;
  DROP TABLE "attractions_locales" CASCADE;
  DROP TABLE "icon_craft_content" CASCADE;
  DROP TABLE "icon_craft_gallery_image_urls" CASCADE;
  DROP TABLE "icon_craft_keywords" CASCADE;
  DROP TABLE "icon_craft" CASCADE;
  DROP TABLE "icon_craft_locales" CASCADE;
  DROP TABLE "icon_luxe_gallery_image_urls" CASCADE;
  DROP TABLE "icon_luxe_keywords" CASCADE;
  DROP TABLE "icon_luxe" CASCADE;
  DROP TABLE "icon_luxe_locales" CASCADE;
  DROP TABLE "getting_here_opening_hours_per_day" CASCADE;
  DROP TABLE "getting_here_methods" CASCADE;
  DROP TABLE "getting_here" CASCADE;
  DROP TABLE "directory_icon_siam_picks" CASCADE;
  DROP TABLE "directory_icon_siam_picks_locales" CASCADE;
  DROP TABLE "directory" CASCADE;
  DROP TABLE "directory_rels" CASCADE;
  DROP TABLE "floors" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "gallery_collections_gallery_image_urls" CASCADE;
  DROP TABLE "gallery_collections" CASCADE;
  DROP TABLE "gallery_collections_locales" CASCADE;
  DROP TABLE "promotions_keywords" CASCADE;
  DROP TABLE "promotions" CASCADE;
  DROP TABLE "promotions_locales" CASCADE;
  DROP TABLE "promotions_rels" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum_page_banners_placement_key";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_shops_opening_hours_per_day_day";
  DROP TYPE "public"."enum_shops_status";
  DROP TYPE "public"."enum_dinings_opening_hours_per_day_day";
  DROP TYPE "public"."enum_dinings_status";
  DROP TYPE "public"."enum_attractions_status";
  DROP TYPE "public"."enum_icon_craft_status";
  DROP TYPE "public"."enum_icon_luxe_status";
  DROP TYPE "public"."enum_getting_here_opening_hours_per_day_day";
  DROP TYPE "public"."enum_getting_here_methods_type";
  DROP TYPE "public"."enum_categories_type";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum_gallery_collections_placement_key";
  DROP TYPE "public"."enum_promotions_status";
  DROP TYPE "public"."enum_promotions_type";`)
}
