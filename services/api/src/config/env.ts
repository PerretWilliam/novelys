import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_FILE: z.string().default("./data/readingos.db"),
  GOOGLE_BOOKS_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:5173,http://127.0.0.1:5173"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(parsed.error.message);
}

export const env = parsed.data;
