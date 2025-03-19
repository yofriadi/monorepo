import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from "@workspace/db";
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";
import { TurnoverCategory, SnapshotTimeRange, DataSource } from "../types";

class Snapshot {
  constructor(public db) {}

  async getAll({
    brandFilter,
    modelFilter,
    referenceFilter,
    yearFilter,
    conditionFilter,
    locationFilter,
    dataSourceFilter,
    timeRange,
    hasBox,
    hasPapers,
    turnover,
  }: {
    brandFilter?: string,
    modelFilter?: string,
    referenceFilter?: string,
    yearFilter?: string,
    conditionFilter?: string,
    locationFilter?: string,
    dataSourceFilter?: DataSource,
    timeRange?: SnapshotTimeRange,
    hasBox?: boolean,
    hasPapers?: boolean,
    turnover?: TurnoverCategory,
  }) {
    const paramObj: Record<string, any> = {};
    if (brandFilter) paramObj.brand_filter = brandFilter;
    if (modelFilter) paramObj.model_filter = modelFilter;
    if (referenceFilter) paramObj.reference_filter = referenceFilter;
    if (yearFilter) paramObj.year_filter = yearFilter;
    if (conditionFilter) paramObj.condition_filter = conditionFilter;
    if (locationFilter) paramObj.location_filter = locationFilter;
    if (dataSourceFilter) paramObj.data_source_filter = dataSourceFilter;
    if (timeRange) paramObj.p_time_range = timeRange;
    if (hasBox) paramObj.has_box_filter = hasBox;
    if (hasPapers) paramObj.has_papers_filter = hasPapers;
    if (turnover) paramObj.turnover_filter = turnover;

    const paramNames = Object.keys(paramObj);
    const sqlParams = paramNames.map(name => `${name} := $${name}`).join(', ');
    const result = await this.db.execute(
      `SELECT * FROM watch_scraping.get_snapshot_analytic(${sqlParams})`,
      paramObj
    );
    return result.rows;
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
  .get('/snapshots', async ({ snapshot, query }) => {
    return await snapshot.getAll(query);
  },
  {
    query: t.Object({
      brand: t.Optional(t.String()),
      model: t.Optional(t.String()),
      reference: t.Optional(t.String()),
      year: t.Optional(t.String()),
      condition: t.Optional(t.String()),
      location: t.Optional(t.String()),
      dataSource: t.Optional(t.Enum(DataSource)),
      timeRange: t.Optional(t.Enum(SnapshotTimeRange)),
      hasBox: t.Optional(t.Boolean()),
      hasPapers: t.Optional(t.Boolean()),
      turnover: t.Optional(t.Enum(TurnoverCategory)),
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
