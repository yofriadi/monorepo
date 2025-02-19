import { Elysia, t } from 'elysia'
import { db } from "@workspace/db";
import { lookupPrices } from "@workspace/db/drizzle/schema";
import { eq } from 'drizzle-orm'
import { camelCase } from 'change-case'

class LookupPrice {
  constructor(public db) {}

  async getAll() {
    return await this.db.select().from(lookupPrices)
  }

  async getById(parameter: string) {
    const data = await this.db
      .select()
      .from(lookupPrices)
      .where(eq(lookupPrices.parameter, parameter))
    if (data.length === 0) throw new Error('lookupPrice not found')
    return data[0]
  }

  async getAllByType() {
    const data = await this.db
      .select()
      .from(lookupPrices)
      .orderBy(lookupPrices.type, lookupPrices.parameter);

    return data.reduce((acc, item) => {
      const typeKey = camelCase(item.type)
      if (!acc[typeKey]) {
        acc[typeKey] = [];
      }
      acc[typeKey].push(item);
      return acc;
    }, {} as Record<string, typeof data>);
  }

  async getByType(type: string) {
    const data = await this.db
      .select()
      .from(lookupPrices)
      .where(eq(lookupPrices.type, type))
      .orderBy(lookupPrices.parameter)
    return data
  }

  async create(payload: { type: string; parameter: string; value: number }) {
    const data = await this.db
      .insert(lookupPrices)
      .values(payload)
      .returning()
    return data[0]
  }

  async update(id: string, payload: { parameter: string; value: number }) {
    const data = await this.db
      .update(lookupPrices)
      .set(payload)
      .where(eq(lookupPrices.id, id))
      .returning()
    if (data.length === 0) throw new Error('lookupPrice not found')
    return data[0]
  }

  async delete(id: string) {
    const data = await this.db
      .delete(lookupPrices)
      .where(eq(lookupPrices.id, id))
      .returning()
    if (data.length === 0) throw new Error('lookupPrice not found')
    return data[0]
  }
}

export const lookupPrice = new Elysia()
  .decorate('lookupPrice', new LookupPrice(db))
  .get('/lookup-prices', async ({ lookupPrice }) => {
    return await lookupPrice.getAll()
  })
  .get('/lookup-prices/by-type', async ({ lookupPrice }) => {
    return await lookupPrice.getAllByType()
  })
  .get('/lookup-prices/:type', async ({ lookupPrice, params: { type }, error }) => {
    try {
      return await lookupPrice.getByType(type)
    } catch {
      return error(404, 'lookupPrice not found')
    }
  }, {
    params: t.Object({
      type: t.Enum({
        brand: 'brand',
        coefficient: 'coefficient',
        dial: 'dial',
        bracelet: 'bracelet',
        'swu type': 'swu type',
        condition: 'condition',
        'reference number': 'reference number'
      })
    })
  })
  .get('/lookup-price/:id', async ({ lookupPrice, params: { id }, error }) => {
    try {
      return await lookupPrice.getById(id)
    } catch {
      return error(404, 'lookupPrice not found')
    }
  }, {
    params: t.Object({
      id: t.String(),
    })
  })
  .post('/lookup-price', async ({ lookupPrice, body }) => {
    return await lookupPrice.create(body)
  }, {
    body: t.Object({
      type: t.Enum({
        brand: 'brand',
        coefficient: 'coefficient',
        dial: 'dial',
        bracelet: 'bracelet',
        'swu type': 'swu type',
        condition: 'condition',
        'reference number': 'reference number'
      }),
      parameter: t.String(),
      value: t.Number(),
    })
  })
  .put('/lookup-price/:id', async ({ lookupPrice, params: { id }, body, error }) => {
    try {
      return await lookupPrice.update(id, body)
    } catch {
      return error(404, 'lookupPrice not found')
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      parameter: t.String(),
      value: t.Number(),
    }),
  })
  .delete('/lookup-price/:id', async ({ lookupPrice, params: { id }, error }) => {
    try {
      return await lookupPrice.delete(id)
    } catch {
      return error(404, 'lookupPrice not found')
    }
  }, {
    params: t.Object({
      id: t.String(),
    })
  })

