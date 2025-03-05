import { Elysia, t } from 'elysia'
import { eq, sql, inArray } from 'drizzle-orm'
import { db } from "@workspace/db";
import { sourcesInWatchScraping, productsInWatchScraping, snapshotsInWatchScraping, messageQueues } from "@workspace/db/drizzle/schema";0

class Source {
  constructor(public db) {}

  async getAll(productIds?: string) {
    let query = this.db.select().from(sourcesInWatchScraping)

    if (productIds) {
      query.where(inArray(sourcesInWatchScraping.productId, productIds.split(',')));
    }

    const sources = await query
    return sources
  }

  async getById(id: string) {
    const sources = await this.db
      .select()
      .from(sourcesInWatchScraping)
      .where(eq(sourcesInWatchScraping.id, id))
      .limit(1)
    if (sources.length === 0) throw new Error('Source not found')
    return sources[0]
  }

  async create(data: { productId: string; url: string }) {
    const createdSource = await this.db.transaction(async (tx: typeof db) => {
      const products = await tx
        .select()
        .from(productsInWatchScraping)
        .where(eq(productsInWatchScraping.id, data.productId));
      if (products.length === 0) {
        throw new Error(`Product with id ${data.productId} does not exist`);
      }

      const [createdSource] = await tx
        .insert(sourcesInWatchScraping)
        .values({
          productId: data.productId,
          platform: new URL(data.url).hostname,
        })
        .returning();

      const [createdSnapshot] = await tx
        .insert(snapshotsInWatchScraping)
        .values({
          sourceId: createdSource.id,
          url: data.url,
        })
        .returning();

      const [message] = await tx
        .insert(messageQueues)
        .values({
          topic: "scraping",
          payload: JSON.stringify({ snapshotId: createdSnapshot.id }),
        })
        .returning();

      await tx.execute(
        sql.raw(`NOTIFY message_events, 'scraping:${message.id}'`),
      );

      return createdSource;
    });

    return {
      id: createdSource.id,
      productId: createdSource.productId,
      platform: createdSource.platform,
      url: createdSource.url,
      createdAt: createdSource.createdAt,
      updatedAt: createdSource.updatedAt,
    };
  }

  async update(id: string, data: { platform?: string }) {
    const sources = await this.db
      .update(sourcesInWatchScraping)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sourcesInWatchScraping.id, id))
      .returning()
    if (sources.length === 0) throw new Error('Source not found')
    return sources[0]
  }

  async remove(id: string) {
    const sources = await this.db
      .delete(sourcesInWatchScraping)
      .where(eq(sourcesInWatchScraping.id, id))
      .returning()
    if (sources.length === 0) throw new Error('Source not found')
    return sources[0]
  }
}

export const source = new Elysia()
  .decorate('source', new Source(db))
  .get('/sources', async ({ source, query: { productIds } }) => {
    return await source.getAll(productIds)
  },
  {
    query: t.Object({
      productIds: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Source']
    }
  })
  .get('/source/:id', async ({ source, params: { id }, error }) => {
    try {
      return await source.getById(id)
    } catch {
      return error(404, 'Source not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Source']
    }
  })
  .post('/source', async ({ source, body, error }) => {
    try {
      return await source.create(body)
    } catch {
      return error(422, 'Unable to create source')
    }
  },
  {
    body: t.Object({
      productId: t.String(),
      url: t.String(),
    }),
    detail: {
      tags: ['Source']
    }
  })
  .patch('/source/:id', async ({ source, params: { id }, body, error }) => {
    try {
      return await source.update(id, body)
    } catch {
      return error(404, 'Source not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      platform: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Source']
    }
  })
  .delete('/source/:id', async ({ source, params: { id }, error }) => {
    try {
      return await source.remove(id)
    } catch {
      return error(404, 'Source not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Source']
    }
  })

