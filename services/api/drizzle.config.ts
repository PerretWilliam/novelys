import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbFile = process.env.DATABASE_FILE ?? "./data/readingos.db";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFile,
  },
});
