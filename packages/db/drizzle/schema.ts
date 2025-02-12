import { pgTable, serial, varchar, timestamp, index, check, text, jsonb, integer, pgSchema, unique, foreignKey, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const watchScraping = pgSchema("watch_scraping");

export const pgmigrations = pgTable("pgmigrations", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	runOn: timestamp("run_on", { mode: 'string' }).notNull(),
});

export const messageQueue = pgTable("message_queue", {
	id: text('id')
    .default(sql`typeid_generate_text('messagequeue'::text)`)
    .primaryKey()
    .notNull(),
	topic: varchar({ length: 255 }).notNull(),
	payload: jsonb().notNull(),
	status: varchar({ length: 10 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	retries: integer().default(0),
}, (table) => [
	index("topic_status_idx").using("btree", table.topic.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	check("message_queue_id_check", sql`CHECK (typeid_check_text(id, 'messagequeue'::text`),
	check("message_queue_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])`),
]);

export const brandsInWatchScraping = watchScraping.table("brands", {
	id: text('id')
    .default(sql`typeid_generate_text('brand'::text)`)
    .primaryKey()
    .notNull(),
	name: varchar({ length: 50 }).notNull(),
	altName: text("alt_name"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("brands_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("brands_name_key").on(table.name),
	check("brands_id_check", sql`CHECK (typeid_check_text(id, 'brand'::text`),
]);

export const modelsInWatchScraping = watchScraping.table("models", {
	id: text('id')
    .default(sql`typeid_generate_text('model'::text)`)
    .primaryKey()
    .notNull(),
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

export const productsInWatchScraping = watchScraping.table("products", {
	id: text('id')
    .default(sql`typeid_generate_text('product'::text)`)
    .primaryKey()
    .notNull(),
	modelId: text("model_id").notNull(),
	referenceNumber: varchar("reference_number", { length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
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
]);

export const sourcesInWatchScraping = watchScraping.table("sources", {
	id: text('id')
    .default(sql`typeid_generate_text('source'::text)`)
    .primaryKey()
    .notNull(),
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

export const coefficients = pgTable("coefficients", {
	id: text('id')
    .default(sql`typeid_generate_text('coefficient'::text)`)
    .primaryKey()
    .notNull(),
	parameter: varchar({ length: 50 }).primaryKey().notNull(),
	value: numeric({ precision: 12, scale:  6 }).notNull(),
}, () => [
	check("coefficients_id_check", sql`CHECK (typeid_check_text(id, 'coefficient'::text`),
]);

export const snapshotsInWatchScraping = watchScraping.table("snapshots", {
	id: text('id')
    .default(sql`typeid_generate_text('snapshot'::text)`)
    .primaryKey()
    .notNull(),
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
			columns: [table.sourceId],
			foreignColumns: [sourcesInWatchScraping.id],
			name: "snapshots_source_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "snapshots_parent_id_fkey"
		}).onDelete("set null"),
	unique("snapshots_url_key").on(table.url),
	check("snapshots_id_check", sql`CHECK (typeid_check_text(id, 'snapshot'::text`),
	check("snapshots_source_id_check", sql`CHECK (typeid_check_text(source_id, 'source'::text`),
	check("snapshots_parent_id_check", sql`CHECK (typeid_check_text(parent_id, 'snapshot'::text`),
]);
