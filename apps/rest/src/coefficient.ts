import { Elysia, t } from 'elysia'
import { db } from "@workspace/db";
import { coefficients } from "@workspace/db/drizzle/schema";
import { eq } from 'drizzle-orm'

class Coefficient {
  constructor(public db) {}

  async getAll() {
    return await this.db.select().from(coefficients)
  }

  async update(parameter: string, payload: { value: number }) {
    const data = await this.db
      .update(coefficients)
      .set(payload)
      .where(eq(coefficients.parameter, parameter))
      .returning()
    if (data.length === 0) throw new Error('Coefficient not found')
    return data[0]
  }
}

export const coefficient = new Elysia()
  .decorate('coefficient', new Coefficient(db))
  .get('/coefficients', async ({ coefficient }) => {
    return await coefficient.getAll()
  })
  .patch('/coefficient/:id', async ({ coefficient, params: { id }, body, error }) => {
    try {
      return await coefficient.update(id, body)
    } catch {
      return error(404, 'Coefficient not found')
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      value: t.Number(),
    }),
  })

