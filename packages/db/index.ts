import '@dotenvx/dotenvx/config'
import { Pool, Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, logger: true });
export const client = new Client({ connectionString: process.env.DATABASE_URL });

