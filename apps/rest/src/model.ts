import { Elysia, t } from 'elysia'
import { eq, inArray } from 'drizzle-orm'
import { db } from "@workspace/db";
import { modelsInWatchScraping, productsInWatchScraping } from "@workspace/db/drizzle/schema";

class Model {
  constructor(public db: typeof db) {}

  async getAll(brandIds?: string) {
    let query = this.db.select().from(modelsInWatchScraping)

    if (brandIds) {
      query.where(inArray(modelsInWatchScraping.brandId, brandIds.split(',')));
    }

    const models = await query
    return models
  }

  async getById(id: string) {
    const models = await this.db
      .select()
      .from(modelsInWatchScraping)
      .where(eq(modelsInWatchScraping.id, id))
      .limit(1)
    if (models.length === 0) throw new Error('Model not found')
    return models[0]
  }

  // Retrieve products by model ID
  async getProducts(modelId: string) {
    return await this.db
      .select()
      .from(productsInWatchScraping)
      .where(eq(productsInWatchScraping.modelId, modelId))
  }

  async create(data: { brandId: string; name: string; altName?: string }) {
    const models = await this.db
      .insert(modelsInWatchScraping)
      .values(data)
      .returning()
    return models[0]
  }

  async update(id: string, data: { name?: string; altName?: string }) {
    const models = await this.db
      .update(modelsInWatchScraping)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modelsInWatchScraping.id, id))
      .returning()
    if (models.length === 0) throw new Error('Model not found')
    return models[0]
  }

  async remove(id: string) {
    const models = await this.db
      .delete(modelsInWatchScraping)
      .where(eq(modelsInWatchScraping.id, id))
      .returning()
    if (models.length === 0) throw new Error('Model not found')
    return models[0]
  }
}

export const model = new Elysia()
  .decorate('model', new Model(db))
  .get('/models', async ({ model, query: { brandIds } }) => {
    return await model.getAll(brandIds)
  },
  {
    query: t.Object({
      brandIds: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Model']
    }
  })
  .get('/model/:id', async ({ model, params: { id }, error }) => {
    try {
      return await model.getById(id)
    } catch {
      return error(404, 'Model not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Model']
    }
  })
  .get('/model/:id/products', async ({ model, params: { id }}) => {
    return await model.getProducts(id)
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Model']
    }
  })
  .post('/model', async ({ model, body, error }) => {
    try {
      return await model.create(body)
    } catch {
      return error(422, 'Unable to create model')
    }
  },
  {
    body: t.Object({
      brandId: t.String(),
      name: t.String(),
      altName: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Model']
    }
  })
  .patch('/model/:id', async ({ model, params: { id }, body, error }) => {
    try {
      return await model.update(id, body)
    } catch {
      return error(404, 'Model not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      altName: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Model']
    }
  })
  .delete('/model/:id', async ({ model, params: { id }, error }) => {
    try {
      return await model.remove(id)
    } catch {
      return error(404, 'Model not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Model']
    }
  })
