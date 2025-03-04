import { Elysia, t } from 'elysia'
import { desc, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { db } from "@workspace/db";
import { brandsInWatchScraping, modelsInWatchScraping, productsInWatchScraping, snapshotsInWatchScraping, sourcesInWatchScraping } from "@workspace/db/drizzle/schema";

class Snapshot {
  constructor(public db) {}

  async getAll(sourceIds?: string) {
    let query = this.db.select({
      snapshotId: snapshotsInWatchScraping.id,
      url: snapshotsInWatchScraping.url,
      createdAt: snapshotsInWatchScraping.createdAt,
      updatedAt: snapshotsInWatchScraping.updatedAt,
      extractedData: snapshotsInWatchScraping.extractedData,
      sourceId: sourcesInWatchScraping.id,
      platform: sourcesInWatchScraping.platform,
      productId: productsInWatchScraping.id,
      referenceNumber: productsInWatchScraping.referenceNumber,
      modelId: modelsInWatchScraping.id,
      modelName: modelsInWatchScraping.name,
      brandId: brandsInWatchScraping.id,
      brandName: brandsInWatchScraping.name,
    })
      .from(snapshotsInWatchScraping)
      .leftJoin(sourcesInWatchScraping, eq(snapshotsInWatchScraping.sourceId, sourcesInWatchScraping.id))
      .leftJoin(productsInWatchScraping, eq(sourcesInWatchScraping.productId, productsInWatchScraping.id))
      .leftJoin(modelsInWatchScraping, eq(productsInWatchScraping.modelId, modelsInWatchScraping.id))
      .leftJoin(brandsInWatchScraping, eq(modelsInWatchScraping.brandId, brandsInWatchScraping.id))
      .where(isNotNull(snapshotsInWatchScraping.sourceId));

    if (sourceIds && sourceIds.length > 0) {
      const sourceIdsArray = sourceIds.split(',');
      query = query.where(inArray(snapshotsInWatchScraping.sourceId, sourceIdsArray));
    }

    const result = await query.orderBy(desc(snapshotsInWatchScraping.createdAt));
    return result;
  }

  async getById(id: string) {
    const snapshots = await this.db
      .select()
      .from(snapshotsInWatchScraping)
      .where(eq(snapshotsInWatchScraping.id, id))
      .limit(1)
    if (snapshots.length === 0) throw new Error('Snapshot not found')
    return snapshots[0]
  }

  async create(data: { sourceId?: string; parentId?: string; url: string; extractedData?: any }) {
    const snapshots = await this.db
      .insert(snapshotsInWatchScraping)
      .values(data)
      .returning()
    return snapshots[0]
  }

  async update(id: string, data: { url?: string; extractedData?: any }) {
    const snapshots = await this.db
      .update(snapshotsInWatchScraping)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(snapshotsInWatchScraping.id, id))
      .returning()
    if (snapshots.length === 0) throw new Error('Snapshot not found')
    return snapshots[0]
  }

  async remove(id: string) {
    const snapshots = await this.db
      .delete(snapshotsInWatchScraping)
      .where(eq(snapshotsInWatchScraping.id, id))
      .returning()
    if (snapshots.length === 0) throw new Error('Snapshot not found')
    return snapshots[0]
  }
}

export const snapshot = new Elysia()
  .decorate('snapshot', new Snapshot(db))
  .get('/snapshots', async ({ snapshot, query: { sourceIds } }) => {
    return await snapshot.getAll(sourceIds)
  },
  {
    query: t.Object({
      sourceIds: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Snapshot']
    }
  })
  .get('/snapshot/:id', async ({ snapshot, params: { id }, error }) => {
    try {
      return await snapshot.getById(id)
    } catch {
      return error(404, 'Snapshot not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Snapshot']
    }
  })
  .post('/snapshot', async ({ snapshot, body, error }) => {
    try {
      return await snapshot.create(body)
    } catch {
      return error(422, 'Unable to create snapshot')
    }
  },
  {
    body: t.Object({
      sourceId: t.Optional(t.String()),
      parentId: t.Optional(t.String()),
      url: t.String(),
      extractedData: t.Optional(t.Any()),
    }),
    detail: {
      tags: ['Snapshot']
    }
  })
  .patch('/snapshot/:id', async ({ snapshot, params: { id }, body, error }) => {
    try {
      return await snapshot.update(id, body)
    } catch {
      return error(404, 'Snapshot not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      url: t.Optional(t.String()),
      extractedData: t.Optional(t.Any()),
    }),
    detail: {
      tags: ['Snapshot']
    }
  })
  .delete('/snapshot/:id', async ({ snapshot, params: { id }, error }) => {
    try {
      return await snapshot.remove(id)
    } catch {
      return error(404, 'Snapshot not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Snapshot']
    }
  })
