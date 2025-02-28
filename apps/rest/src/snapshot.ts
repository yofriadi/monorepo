import { Elysia, t } from 'elysia'
import { eq, inArray } from 'drizzle-orm'
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";

class Snapshot {
  constructor(public db) {}

  async getAll(sourceIds?: string) {
    let query = this.db.select().from(snapshotsInWatchScraping)

    if (sourceIds) {
      query.where(inArray(snapshotsInWatchScraping.sourceId, sourceIds.split(',')));
    }

    const sources = await query
    return sources
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
