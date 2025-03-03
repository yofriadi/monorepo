import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { PgDatabase } from 'drizzle-orm/pg-core'
import { db } from "@workspace/db";
import { brandsInWatchScraping, modelsInWatchScraping } from "@workspace/db/drizzle/schema";

class Brand {
  constructor(public db: PgDatabase) {}

  async getAll() {
    return await this.db.select().from(brandsInWatchScraping)
  }

  // Retrieve a single brand by its ID
  async getById(id: string) {
    const brands = await this.db
      .select()
      .from(brandsInWatchScraping)
      .where(eq(brandsInWatchScraping.id, id))
      .limit(1)
    if (brands.length === 0) throw new Error('Brand not found')
    return brands[0]
  }

  // Retrieve models by brand ID
  async getModels(brandId: string) {
    return await this.db
      .select()
      .from(modelsInWatchScraping)
      .where(eq(modelsInWatchScraping.brandId, brandId))
  }

  // Create a new brand record
  async create(data: { name: string; alt_name?: string }) {
    const brands = await this.db
      .insert(brandsInWatchScraping)
      .values(data)
      .returning()
    return brands[0]
  }

  // Update an existing brand
  async update(id: string, data: { name?: string; alt_name?: string }) {
    const brands = await this.db
      .update(brandsInWatchScraping)
      .set({ ...data, updated_at: new Date() })
      .where(eq(brandsInWatchScraping.id, id))
      .returning()
    if (brands.length === 0) throw new Error('Brand not found')
    return brands[0]
  }

  // Delete a brand
  async remove(id: string) {
    const brands = await this.db
      .delete(brandsInWatchScraping)
      .where(eq(brandsInWatchScraping.id, id))
      .returning()
    if (brands.length === 0) throw new Error('Brand not found')
    return brands[0]
  }
}

export const brand = new Elysia()
  .decorate('brand', new Brand(db))
  .get('/brands', async ({ brand }) => {
    return await brand.getAll()
  }, {
    detail: {
      tags: ['Brand']
    }
  })
  .get('/brand/:id', async ({ brand, params: { id }, error }) => {
    try {
      return await brand.getById(id)
    } catch {
      return error(404, 'Brand not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Brand']
    }
  })
  .get('/brand/:id/models', async ({ brand, params: { id } }) => {
    return await brand.getModels(id)
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Brand']
    }
  })
  .post('/brand', async ({ brand, body, error }) => {
    try {
      return await brand.create(body)
    } catch {
      return error(422, 'Unable to create brand')
    }
  },
  {
    body: t.Object({
      name: t.String(),
      altName: t.Optional(t.String()),
    }),
    detail: {
      tags: ['Brand']
    }
  })
  .patch('/brand/:id', async ({ brand, params: { id }, body, error }) => {
    try {
      return await brand.update(id, body)
    } catch {
      return error(404, 'Brand not found')
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
      tags: ['Brand']
    }
  })
  .delete('/brand/:id', async ({ brand, params: { id }, error }) => {
    try {
      return await brand.remove(id)
    } catch {
      return error(404, 'Brand not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['Brand']
    }
  })
