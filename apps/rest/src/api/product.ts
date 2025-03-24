import { Elysia, t } from 'elysia'
import { eq, inArray, sql, aliasedTable, and } from 'drizzle-orm'
import { db } from "@workspace/db";
import {
  brandsInWatchScraping,
  modelsInWatchScraping,
  productsInWatchScraping,
  sourcesInWatchScraping,
  snapshotsInWatchScraping
} from "@workspace/db/drizzle/schema";

enum TurnoverCategory {
  FAST = 'fast',
  MODERATE = 'moderate',
  SLOW = 'slow'
}

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
    const products = await this.db
      .select()
      .from(productsInWatchScraping)
      .where(eq(productsInWatchScraping.id, id))
      .limit(1)
    if (products.length === 0) throw new Error('Product not found')
    return products[0]
  }

  async getSnapshotByProductId(id: string, filters?: { condition?: string; year?: string }) {
    const childSnapshot = aliasedTable(snapshotsInWatchScraping, 'child_snapshot');

    const conditions = [
      eq(productsInWatchScraping.id, id),
      filters?.condition 
        ? sql`(${sql.join(
            filters.condition.split(',').map(c => {
              const trimmedCondition = c.trim();
              if (trimmedCondition.toLowerCase() === 'new') {
                return sql`COALESCE(${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Condition', ${childSnapshot.extractedData} ->> 'condition') ILIKE ${'New%'}`;
              }
              return sql`COALESCE(${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Condition', ${childSnapshot.extractedData} ->> 'condition') ILIKE ${'%' + trimmedCondition + '%'}`;
            }),
            sql` OR `
          )})`
        : undefined,
      filters?.year
        ? sql`${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Year of production' = ${filters.year}`
        : undefined,
    ].filter(Boolean);

    const query = this.db
      .select({
        brandName: brandsInWatchScraping.name,
        modelName: modelsInWatchScraping.name,
        productReferenceNumber: productsInWatchScraping.referenceNumber,
        platform: sourcesInWatchScraping.platform,
        url: childSnapshot.url,
        createdAt: childSnapshot.createdAt,
        currency: sql`${childSnapshot.extractedData} -> 'price' ->> 'currency'`,
        price: sql`${childSnapshot.extractedData} -> 'price' ->> 'amount'`,
        dial: sql`COALESCE(${childSnapshot.extractedData} -> 'productInformation' -> 'Case' ->> 'Dial', ${childSnapshot.extractedData} ->> 'dial')`,
        caseDiameter: sql`${childSnapshot.extractedData} -> 'productInformation' -> 'Case' ->> 'Case diameter'`,
        caseMaterial: sql`COALESCE(${childSnapshot.extractedData} -> 'productInformation' -> 'Case' ->> 'Case material', ${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Case material')`,
        yearOfProduction: sql`${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Year of production'`,
        scopeOfDelivery: sql`${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Scope of delivery'`,
        location: sql`${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Location'`,
        condition: sql`COALESCE(${childSnapshot.extractedData} -> 'productInformation' -> 'Basic Info' ->> 'Condition', ${childSnapshot.extractedData} ->> 'condition')`,
        source: sql`${childSnapshot.extractedData} ->> 'from'`,
        images: sql`(
          SELECT string_agg(link, ', ')
          FROM jsonb_array_elements_text(${childSnapshot.extractedData} -> 'imageCarouselLinks') AS link
        )`,
      })
      .from(productsInWatchScraping)
      .leftJoin(modelsInWatchScraping, eq(productsInWatchScraping.modelId, modelsInWatchScraping.id))
      .leftJoin(brandsInWatchScraping, eq(modelsInWatchScraping.brandId, brandsInWatchScraping.id))
      .leftJoin(sourcesInWatchScraping, eq(sourcesInWatchScraping.productId, productsInWatchScraping.id))
      .leftJoin(snapshotsInWatchScraping, eq(snapshotsInWatchScraping.sourceId, sourcesInWatchScraping.id))
      .leftJoin(childSnapshot, eq(childSnapshot.parentId, snapshotsInWatchScraping.id))
      .where(and(...conditions));

    const snapshots = await query;
    if (!snapshots.length) throw new Error('Snapshots not found')
    return snapshots
  }

  async create(data: { modelId: string; referenceNumber: string }) {
    const products = await this.db
      .insert(productsInWatchScraping)
      .values(data)
      .returning()
    return products[0]
  }

  async update(id: string, data: { referenceNumber?: string; turnoverCategory?: TurnoverCategory }) {
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
    detail: {
      tags: ['Product']
    }
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
    detail: {
      tags: ['Product']
    }
  })
  .get('/product/:id/snapshots', async ({ product, params: { id }, query, error }) => {
    try {
      return await product.getSnapshotByProductId(id, {
        condition: query.condition,
        year: query.year
      })
    } catch {
      return error(404, 'Product not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      condition: t.Optional(t.String()),
      year: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Product']
    }
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
    detail: {
      tags: ['Product']
    }
  })
  .put('/product/:id', async ({ product, params: { id }, body, error }) => {
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
    detail: {
      tags: ['Product'],
    },
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
      turnoverCategory: t.Optional(t.Enum(TurnoverCategory)),
    }),
    detail: {
      tags: ['Product']
    }
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
    detail: {
      tags: ['Product']
    }
  })

