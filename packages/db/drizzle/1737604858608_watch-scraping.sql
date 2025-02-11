-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "watch";
--> statement-breakpoint
CREATE SEQUENCE "watch"."products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "watch"."brands_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "watch"."models_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "watch"."product_price_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "watch"."product_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."brands_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."models_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."product_price_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."product_snapshots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "watch"."products" (
	"id" integer PRIMARY KEY DEFAULT nextval('watch.products_id_seq'::regclass) NOT NULL,
	"model_id" integer NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"source_url" bigint NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "watch"."brands" (
	"id" smallint PRIMARY KEY DEFAULT nextval('watch.brands_id_seq'::regclass) NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "watch"."models" (
	"id" integer PRIMARY KEY DEFAULT nextval('watch.models_id_seq'::regclass) NOT NULL,
	"brand_id" smallint NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "watch"."product_snapshots" (
	"id" bigint PRIMARY KEY DEFAULT nextval('watch.product_snapshots_id_seq'::regclass) NOT NULL,
	"product_id" integer NOT NULL,
	"source_url" text NOT NULL,
	"production_year" smallint,
	"currency" char(1) NOT NULL,
	"listing_code" varchar(500) NOT NULL,
	"reference_number" varchar(500) NOT NULL,
	"caliber" jsonb,
	"case" jsonb,
	"bracelet_strap" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch"."product_price_snapshots" (
	"id" bigint PRIMARY KEY DEFAULT nextval('watch.product_price_snapshots_id_seq'::regclass) NOT NULL,
	"product_snapshot_id" bigint NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY DEFAULT nextval('products_id_seq'::regclass) NOT NULL,
	"model_id" integer NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"source_url" bigint NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_snapshots" (
	"id" bigint PRIMARY KEY DEFAULT nextval('product_snapshots_id_seq'::regclass) NOT NULL,
	"product_id" integer NOT NULL,
	"source_url" text NOT NULL,
	"production_year" smallint,
	"currency" char(1) NOT NULL,
	"listing_code" varchar(500) NOT NULL,
	"reference_number" varchar(500) NOT NULL,
	"caliber" jsonb,
	"case" jsonb,
	"bracelet_strap" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" smallint PRIMARY KEY DEFAULT nextval('brands_id_seq'::regclass) NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" integer PRIMARY KEY DEFAULT nextval('models_id_seq'::regclass) NOT NULL,
	"brand_id" smallint NOT NULL,
	"name" varchar(500) NOT NULL,
	"alt_name" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_price_snapshots" (
	"id" bigint PRIMARY KEY DEFAULT nextval('product_price_snapshots_id_seq'::regclass) NOT NULL,
	"product_snapshot_id" bigint NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "watch"."products" ADD CONSTRAINT "products_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "watch"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch"."models" ADD CONSTRAINT "models_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "watch"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch"."product_snapshots" ADD CONSTRAINT "product_snapshots_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "watch"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch"."product_price_snapshots" ADD CONSTRAINT "product_price_snapshots_product_snapshot_id_fk" FOREIGN KEY ("product_snapshot_id") REFERENCES "watch"."product_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_snapshots" ADD CONSTRAINT "product_snapshots_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_snapshots" ADD CONSTRAINT "product_price_snapshots_product_snapshot_id_fk" FOREIGN KEY ("product_snapshot_id") REFERENCES "public"."product_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "index_products_model_id_name" ON "watch"."products" USING btree ("model_id" int4_ops,"name" int4_ops);--> statement-breakpoint
CREATE INDEX "index_brands_name" ON "watch"."brands" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "index_models_name_brand_id" ON "watch"."models" USING btree ("name" int2_ops,"brand_id" int2_ops);--> statement-breakpoint
CREATE INDEX "index_product_snapshots_product_id_reference_number_production_" ON "watch"."product_snapshots" USING btree ("product_id" int4_ops,"reference_number" text_ops,"production_year" text_ops);--> statement-breakpoint
CREATE INDEX "index_product_price_snapshots_product_snapshot_id_price" ON "watch"."product_price_snapshots" USING btree ("product_snapshot_id" int8_ops,"price" int8_ops);--> statement-breakpoint
CREATE INDEX "index_products_model_id_name" ON "products" USING btree ("model_id" int4_ops,"name" int4_ops);--> statement-breakpoint
CREATE INDEX "index_product_snapshots_product_id_reference_number_production_" ON "product_snapshots" USING btree ("product_id" int4_ops,"reference_number" text_ops,"production_year" text_ops);--> statement-breakpoint
CREATE INDEX "index_brands_name" ON "brands" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "index_models_name_brand_id" ON "models" USING btree ("name" int2_ops,"brand_id" int2_ops);--> statement-breakpoint
CREATE INDEX "index_product_price_snapshots_product_snapshot_id_price" ON "product_price_snapshots" USING btree ("product_snapshot_id" int8_ops,"price" int8_ops);
*/