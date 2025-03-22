import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from "@workspace/db";
import *  as changeKeys from 'change-case/keys'
import { snapshotsInWatchScraping } from "@workspace/db/drizzle/schema";
import { TurnoverCategory, SnapshotTimeRange, DataSource } from "../types";

class Snapshot {
  constructor(public db) {}

  async getAll({
    brand,
    model,
    reference,
    year,
    condition,
    location,
    dataSource,
    timeRange,
    hasBox,
    hasPapers,
    turnover,
  }: {
    brand?: string,
    model?: string,
    reference?: string,
    year?: string,
    condition?: string,
    location?: string,
    dataSource?: DataSource,
    timeRange?: SnapshotTimeRange,
    hasBox?: boolean,
    hasPapers?: boolean,
    turnover?: TurnoverCategory,
  }) {
    const param: Record<string, string | boolean> = {};
    if (brand) param.brand_filter = brand;
    if (model) param.model_filter = model;
    if (reference) param.reference_filter = reference;
    if (year) param.year_filter = year;
    if (condition) param.condition_filter = condition;
    if (location) param.location_filter = location;
    if (dataSource) param.data_source_filter = dataSource;
    if (timeRange) param.p_time_range = timeRange;
    if (hasBox) param.has_box_filter = hasBox;
    if (hasPapers) param.has_papers_filter = hasPapers;
    if (turnover) param.turnover_filter = turnover;

    const paramNames = Object.keys(param);
    const sqlParams = paramNames.map(name => `${name} := $${name}`).join(', ');
    const result = await this.db.execute(
      `SELECT * FROM watch_scraping.get_snapshot_analytic(${sqlParams});`,
      param
    );
    // TODO: fix row type
    return result.rows.map((row: any) => changeKeys.camelCase(row));
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
