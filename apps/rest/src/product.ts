import { Elysia, t } from 'elysia'
import { eq, inArray, sql, aliasedTable } from 'drizzle-orm'
import *  as changeKeys from 'change-case/keys'
import { db } from "@workspace/db";
import {
  brandsInWatchScraping,
  modelsInWatchScraping,
  productsInWatchScraping,
  sourcesInWatchScraping,
  snapshotsInWatchScraping
} from "@workspace/db/drizzle/schema";

class Product {
  constructor(public db) {}

  async getAll(modelIds?: string) {
    let query = this.db.select().from(productsInWatchScraping)

    if (modelIds) {
      query.where(inArray(productsInWatchScraping.modelId, modelIds.split(',')));
    }

    const products = await query
    return products
  }

  async getById(id: string) {
    const { rows } = await db.execute(
      sql`
        SELECT
          brand.name AS brand_name,
          model.name AS model_name,
          product.reference_number AS product_reference_number,
          source.platform,
          child_snapshot.url,
          child_snapshot.created_at,
          child_snapshot.extracted_data ->> 'currency' AS currency,
          child_snapshot.extracted_data ->> 'price' AS price,
          (
		        SELECT string_agg(link, ', ')
		        FROM jsonb_array_elements_text(child_snapshot.extracted_data -> 'imageCarouselLinks') AS link
	        ) AS images
        FROM
          watch_scraping.products product
          LEFT JOIN watch_scraping.models model ON product.model_id = model.id
          LEFT JOIN watch_scraping.brands brand ON model.brand_id = brand.id
          LEFT JOIN watch_scraping.sources source ON source.product_id = product.id
          LEFT JOIN watch_scraping.snapshots snapshot ON snapshot.source_id = source.id
          LEFT JOIN watch_scraping.snapshots child_snapshot ON child_snapshot.parent_id = snapshot.id
        WHERE
          product.id = ${id}
	        AND child_snapshot.extracted_data ->> 'currency' IS NOT NULL
	        AND child_snapshot.extracted_data ->> 'price' IS NOT NULL
	        AND (
		        SELECT string_agg(link, ', ')
		        FROM jsonb_array_elements_text(child_snapshot.extracted_data -> 'imageCarouselLinks') AS link
	        ) IS NOT NULL;
      `
    );

    /*const parentSnapshot = aliasedTable(snapshotsInWatchScraping, 'parent_snapshot');
    const childSnapshot = aliasedTable(snapshotsInWatchScraping, 'child_snapshot');
    const products = await db
      .select({
        brandName: brandsInWatchScraping.name,
        modelName: modelsInWatchScraping.name,
        referenceNumber: productsInWatchScraping.referenceNumber,
        platform: sourcesInWatchScraping.platform,
        url: childSnapshot.url,
        createdAt: childSnapshot.createdAt,
        currency: sql`${childSnapshot.extracted_data} ->> 'currency'`,
        price: sql`${childSnapshot.extracted_data} ->> 'price'`,
      })
      .from(productsInWatchScraping)
      .leftJoin(sourcesInWatchScraping, eq(sourcesInWatchScraping.productId, productsInWatchScraping.id))
      .leftJoin(parentSnapshot, eq(parentSnapshot.sourceId, sourcesInWatchScraping.id))
      .leftJoin(childSnapshot, eq(childSnapshot.sourceId, parentSnapshot.id))
      .leftJoin(modelsInWatchScraping, eq(productsInWatchScraping.modelId, modelsInWatchScraping.id))
      .leftJoin(brandsInWatchScraping, eq(modelsInWatchScraping.brandId, brandsInWatchScraping.id))
      .where(eq(productsInWatchScraping.id, id));*/

    if (rows.length === 0) throw new Error('Product not found')
    return rows.map(row => changeKeys.camelCase(row))
  }

  async create(data: { modelId: string; referenceNumber: string }) {
    const products = await this.db
      .insert(productsInWatchScraping)
      .values(data)
      .returning()
    return products[0]
  }

  async update(id: string, data: { referenceNumber?: string }) {
    const products = await this.db
      .update(productsInWatchScraping)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productsInWatchScraping.id, id))
      .returning()
    if (products.length === 0) throw new Error('Product not found')
    return products[0]
  }

  async remove(id: string) {
    const products = await this.db
      .delete(productsInWatchScraping)
      .where(eq(productsInWatchScraping.id, id))
      .returning()
    if (products.length === 0) throw new Error('Product not found')
    return products[0]
  }
}

export const product = new Elysia()
  .decorate('product', new Product(db))
  .get('/products', async ({ product, query: { modelIds }  }) => {
    return await product.getAll(modelIds)
  },
  {
    query: t.Object({
      modelIds: t.Optional(t.String()),
    }),
  })
  .get('/product/:id', async ({ product, params: { id }, error }) => {
    try {
      return await product.getById(id)
    } catch {
      return error(404, 'Product not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  })
  .post('/product', async ({ product, body, error }) => {
    try {
      return await product.create(body)
    } catch {
      return error(422, 'Unable to create product')
    }
  },
  {
    body: t.Object({
      modelId: t.String(),
      referenceNumber: t.String(),
    }),
  })
  .patch('/product/:id', async ({ product, params: { id }, body, error }) => {
    try {
      return await product.update(id, body)
    } catch {
      return error(404, 'Product not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      referenceNumber: t.Optional(t.String()),
    }),
  })
  .delete('/product/:id', async ({ product, params: { id }, error }) => {
    try {
      return await product.remove(id)
    } catch {
      return error(404, 'Product not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  })

