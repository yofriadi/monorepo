import { pgSchema, index, foreignKey, unique, check, text, varchar, timestamp, jsonb, numeric, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const watchScraping = pgSchema("watch_scraping");

export const modelsInWatchScraping = watchScraping.table("models", {
	id: text('id').default(sql`typeid_generate_text('model'::text)`).primaryKey().notNull(),
	brandId: text("brand_id").notNull(),
	name: varchar({ length: 50 }).notNull(),
	altName: text("alt_name"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("models_brand_id_idx").using("btree", table.brandId.asc().nullsLast().op("text_ops")),
	index("models_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brandsInWatchScraping.id],
			name: "models_brand_id_fkey"
		}).onDelete("cascade"),
	unique("models_brand_id_name_key").on(table.brandId, table.name),
	check("models_id_check", sql`CHECK (typeid_check_text(id, 'model'::text`),
]);

export const snapshotsInWatchScraping = watchScraping.table("snapshots", {
	id: text('id').default(sql`typeid_generate_text('snapshot'::text)`).primaryKey().notNull(),
	sourceId: text("source_id"),
	parentId: text("parent_id"),
	url: text().notNull(),
	extractedData: jsonb("extracted_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("snapshots_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("snapshots_source_id_idx").using("btree", table.sourceId.asc().nullsLast().op("text_ops")),
	index("snapshots_updated_at_idx").using("btree", table.updatedAt.asc().nullsLast().op("timestamptz_ops")),
	index("snapshots_url_idx").using("btree", table.url.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "snapshots_parent_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceId],
			foreignColumns: [sourcesInWatchScraping.id],
			name: "snapshots_source_id_fkey"
		}).onDelete("cascade"),
	check("snapshots_id_check", sql`CHECK (typeid_check_text(id, 'snapshot'::text`),
	check("snapshots_parent_id_check", sql`CHECK (typeid_check_text(parent_id, 'snapshot'::text`),
	check("snapshots_source_id_check", sql`CHECK (typeid_check_text(source_id, 'source'::text`),
]);

export const sourcesInWatchScraping = watchScraping.table("sources", {
	id: text('id').default(sql`typeid_generate_text('source'::text)`).primaryKey().notNull(),
	productId: text("product_id").notNull(),
	platform: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("sources_platform_idx").using("btree", table.platform.asc().nullsLast().op("text_ops")),
	index("sources_product_id_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [productsInWatchScraping.id],
			name: "sources_product_id_fkey"
		}).onDelete("cascade"),
	check("sources_id_check", sql`CHECK (typeid_check_text(id, 'source'::text`),
]);

export const productsInWatchScraping = watchScraping.table("products", {
	id: text('id').default(sql`typeid_generate_text('product'::text)`).primaryKey().notNull(),
	modelId: text("model_id").notNull(),
	referenceNumber: varchar("reference_number", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	turnoverCategory: varchar("turnover_category", { length: 8 }),
}, (table) => [
	index("products_model_id_idx").using("btree", table.modelId.asc().nullsLast().op("text_ops")),
	index("products_reference_number_idx").using("btree", table.referenceNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [modelsInWatchScraping.id],
			name: "products_model_id_fkey"
		}).onDelete("cascade"),
	unique("products_model_id_reference_number_key").on(table.modelId, table.referenceNumber),
	check("products_id_check", sql`CHECK (typeid_check_text(id, 'product'::text`),
	check("reference_number_not_empty", sql`length(TRIM(BOTH FROM reference_number)) > 0`),
	check("products_turnover_category_check", sql`(turnover_category)::text = ANY ((ARRAY['fast'::character varying, 'moderate'::character varying, 'slow'::character varying])::text[])`),
]);

export const brandsInWatchScraping = watchScraping.table("brands", {
	id: text('id').default(sql`typeid_generate_text('brand'::text)`).primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	altName: text("alt_name"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("brands_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("brands_name_key").on(table.name),
	check("brands_id_check", sql`CHECK (typeid_check_text(id, 'brand'::text`),
]);

export const unifiedSnapshotPricesInWatchScraping = watchScraping.view("unified_snapshot_prices", {
	id: text(),
	dataSource: text("data_source"),
	brandName: varchar("brand_name", { length: 50 }),
	modelName: varchar("model_name", { length: 50 }),
	referenceNumber: varchar("reference_number", { length: 50 }),
	currency: text(),
	price: numeric(),
	location: text(),
	yearOfProduction: text("year_of_production"),
	hasBox: boolean("has_box"),
	hasPapers: boolean("has_papers"),
	conditionStatus: text("condition_status"),
	dialColor: text("dial_color"),
	braceletMaterial: text("bracelet_material"),
	timeRange: text("time_range"),
}).as(sql`WITH snapshot_with_sources AS ( SELECT s.id, s.extracted_data, s.created_at AS snapshot_date, s.extracted_data ->> 'from'::text AS data_source, COALESCE(s.source_id, p_1.source_id) AS effective_source_id FROM watch_scraping.snapshots s LEFT JOIN watch_scraping.snapshots p_1 ON s.parent_id = p_1.id WHERE s.extracted_data IS NOT NULL ) SELECT sws.id, sws.data_source, b.name AS brand_name, m.name AS model_name, p.reference_number, (sws.extracted_data -> 'price'::text) ->> 'currency'::text AS currency, CASE WHEN sws.data_source = 'carousell'::text THEN NULLIF((sws.extracted_data -> 'price'::text) ->> 'amount'::text, ''::text)::numeric WHEN sws.data_source = 'chrono24'::text THEN NULLIF(regexp_replace(sws.extracted_data ->> 'price'::text, '[^0-9\.]'::text, ''::text, 'g'::text), ''::text)::numeric ELSE NULL::numeric END AS price, CASE WHEN sws.data_source = 'chrono24'::text THEN split_part(((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Location'::text, ','::text, 1) WHEN sws.data_source = 'carousell'::text THEN 'Singapore'::text ELSE NULL::text END AS location, CASE WHEN sws.data_source = 'chrono24'::text THEN CASE WHEN (((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Year of production'::text) = 'Unknown'::text OR (((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Year of production'::text) IS NULL THEN NULL::text ELSE regexp_replace(COALESCE(((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Year of production'::text, ''::text), '[^0-9]'::text, ''::text, 'g'::text) END WHEN sws.data_source = 'carousell'::text THEN CASE WHEN ((sws.extracted_data -> 'description'::text) ->> 'Dated'::text) IS NOT NULL THEN "substring"((sws.extracted_data -> 'description'::text) ->> 'Dated'::text, '[0-9]{4}'::text) ELSE NULL::text END ELSE NULL::text END AS year_of_production, CASE WHEN sws.data_source = 'chrono24'::text THEN (EXISTS ( SELECT 1 FROM jsonb_array_elements_text( CASE WHEN jsonb_typeof(sws.extracted_data -> 'condition'::text) = 'array'::text THEN sws.extracted_data -> 'condition'::text ELSE to_jsonb(ARRAY[sws.extracted_data ->> 'condition'::text]) END) cond(value) WHERE cond.value ~~* '%box%'::text)) OR COALESCE(((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Scope of delivery'::text, ''::text) ~~* '%box%'::text WHEN sws.data_source = 'carousell'::text THEN COALESCE((sws.extracted_data -> 'description'::text) ->> 'Original Box'::text, ''::text) ~~* '%yes%'::text ELSE false END AS has_box, CASE WHEN sws.data_source = 'chrono24'::text THEN (EXISTS ( SELECT 1 FROM jsonb_array_elements_text( CASE WHEN jsonb_typeof(sws.extracted_data -> 'condition'::text) = 'array'::text THEN sws.extracted_data -> 'condition'::text ELSE to_jsonb(ARRAY[sws.extracted_data ->> 'condition'::text]) END) cond(value) WHERE cond.value ~~* '%papers%'::text OR cond.value ~~* '%certificate%'::text)) OR COALESCE(((sws.extracted_data -> 'productInformation'::text) -> 'Basic Info'::text) ->> 'Scope of delivery'::text, ''::text) ~~* '%papers%'::text WHEN sws.data_source = 'carousell'::text THEN COALESCE((sws.extracted_data -> 'description'::text) ->> 'Original Cert/Papers'::text, ''::text) ~~* '%yes%'::text ELSE false END AS has_papers, CASE WHEN sws.data_source = 'chrono24'::text THEN sws.extracted_data ->> 'condition'::text WHEN sws.data_source = 'carousell'::text THEN (sws.extracted_data -> 'details'::text) ->> 'condition'::text ELSE NULL::text END AS condition_status, CASE WHEN sws.data_source = 'chrono24'::text THEN ((sws.extracted_data -> 'productInformation'::text) -> 'Case'::text) ->> 'Dial'::text WHEN sws.data_source = 'carousell'::text THEN (sws.extracted_data -> 'description'::text) ->> 'Dial'::text ELSE NULL::text END AS dial_color, CASE WHEN sws.data_source = 'chrono24'::text THEN ((sws.extracted_data -> 'productInformation'::text) -> 'Bracelet/strap'::text) ->> 'Bracelet material'::text WHEN sws.data_source = 'carousell'::text THEN (sws.extracted_data -> 'description'::text) ->> 'Material'::text ELSE NULL::text END AS bracelet_material, CASE WHEN sws.snapshot_date > (CURRENT_DATE - '1 mon'::interval) THEN '1_month'::text WHEN sws.snapshot_date > (CURRENT_DATE - '3 mons'::interval) THEN '3_month'::text WHEN sws.snapshot_date > (CURRENT_DATE - '6 mons'::interval) THEN '6_month'::text WHEN sws.snapshot_date > (CURRENT_DATE - '1 year'::interval) THEN '1_year'::text ELSE 'older'::text END AS time_range FROM snapshot_with_sources sws LEFT JOIN watch_scraping.sources src ON sws.effective_source_id = src.id LEFT JOIN watch_scraping.products p ON src.product_id = p.id LEFT JOIN watch_scraping.models m ON p.model_id = m.id LEFT JOIN watch_scraping.brands b ON m.brand_id = b.id`);
