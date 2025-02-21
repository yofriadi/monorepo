import { relations } from "drizzle-orm/relations";
import { brandsInWatchScraping, modelsInWatchScraping, productsInWatchScraping, snapshotsInWatchScraping, sourcesInWatchScraping } from "./schema";

export const modelsInWatchScrapingRelations = relations(modelsInWatchScraping, ({one, many}) => ({
	brandsInWatchScraping: one(brandsInWatchScraping, {
		fields: [modelsInWatchScraping.brandId],
		references: [brandsInWatchScraping.id]
	}),
	productsInWatchScrapings: many(productsInWatchScraping),
}));

export const brandsInWatchScrapingRelations = relations(brandsInWatchScraping, ({many}) => ({
	modelsInWatchScrapings: many(modelsInWatchScraping),
}));

export const productsInWatchScrapingRelations = relations(productsInWatchScraping, ({one, many}) => ({
	modelsInWatchScraping: one(modelsInWatchScraping, {
		fields: [productsInWatchScraping.modelId],
		references: [modelsInWatchScraping.id]
	}),
	sourcesInWatchScrapings: many(sourcesInWatchScraping),
}));

export const snapshotsInWatchScrapingRelations = relations(snapshotsInWatchScraping, ({one, many}) => ({
	snapshotsInWatchScraping: one(snapshotsInWatchScraping, {
		fields: [snapshotsInWatchScraping.parentId],
		references: [snapshotsInWatchScraping.id],
		relationName: "snapshotsInWatchScraping_parentId_snapshotsInWatchScraping_id"
	}),
	snapshotsInWatchScrapings: many(snapshotsInWatchScraping, {
		relationName: "snapshotsInWatchScraping_parentId_snapshotsInWatchScraping_id"
	}),
	sourcesInWatchScraping: one(sourcesInWatchScraping, {
		fields: [snapshotsInWatchScraping.sourceId],
		references: [sourcesInWatchScraping.id]
	}),
}));

export const sourcesInWatchScrapingRelations = relations(sourcesInWatchScraping, ({one, many}) => ({
	snapshotsInWatchScrapings: many(snapshotsInWatchScraping),
	productsInWatchScraping: one(productsInWatchScraping, {
		fields: [sourcesInWatchScraping.productId],
		references: [productsInWatchScraping.id]
	}),
}));