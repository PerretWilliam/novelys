import path from "node:path";
import { nowIso } from "@readingos/shared";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, rawDb } from "./client";

let isBootstrapped = false;

export const bootstrapDatabase = async (): Promise<void> => {
  if (isBootstrapped) {
    return;
  }

  migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), "drizzle"),
  });

  rawDb
    .prepare(
      `
        INSERT INTO user_preferences (id, search_lang, theme_mode, show_covers, compact_mode, updated_at)
        VALUES (1, 'fr', 'system', 1, 0, ?)
        ON CONFLICT(id) DO NOTHING
      `,
    )
    .run(nowIso());

  isBootstrapped = true;
};
