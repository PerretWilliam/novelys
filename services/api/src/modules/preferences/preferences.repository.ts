import type { Preferences, UpdatePreferencesInput } from "@readingos/shared";
import { nowIso } from "@readingos/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { userPreferencesTable } from "../../db/schema";
import { HttpError } from "../../utils/http-error";

const mapPreferencesRow = (row: typeof userPreferencesTable.$inferSelect): Preferences => ({
  searchLang: row.searchLang as Preferences["searchLang"],
  themeMode: row.themeMode as Preferences["themeMode"],
  showCovers: row.showCovers === 1,
  compactMode: row.compactMode === 1,
  updatedAt: row.updatedAt,
});

const getPreferencesRow = async () => {
  const [row] = await db.select().from(userPreferencesTable).where(eq(userPreferencesTable.id, 1)).limit(1);
  if (!row) {
    throw new HttpError(500, "Préférences indisponibles");
  }
  return row;
};

export const getPreferences = async (): Promise<Preferences> => {
  const row = await getPreferencesRow();
  return mapPreferencesRow(row);
};

export const updatePreferences = async (payload: UpdatePreferencesInput): Promise<Preferences> => {
  const [updated] = await db
    .update(userPreferencesTable)
    .set({
      searchLang: payload.searchLang,
      themeMode: payload.themeMode,
      showCovers: payload.showCovers === undefined ? undefined : payload.showCovers ? 1 : 0,
      compactMode: payload.compactMode === undefined ? undefined : payload.compactMode ? 1 : 0,
      updatedAt: nowIso(),
    })
    .where(eq(userPreferencesTable.id, 1))
    .returning();

  if (!updated) {
    throw new HttpError(500, "Impossible de sauvegarder les préférences");
  }

  return mapPreferencesRow(updated);
};
