import '@dotenvx/dotenvx/config'
import path from 'path';
import { Pool, Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { runner } from 'node-pg-migrate';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, logger: true });
export const client = new Client({ connectionString: process.env.DATABASE_URL });

export async function runMigrations() {
  const options = {
    direction: 'up',
    databaseUrl: process.env.DATABASE_URL,
    dir: path.join(__dirname, 'migrations'),
    migrationFileExtension: 'sql',
  };

  try {
    await runner(options);
    console.log('Migrations complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

