import '@dotenvx/dotenvx/config'
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./schema",
  dialect: "postgresql",
  schemaFilter: ["public", "watch_scraping"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
