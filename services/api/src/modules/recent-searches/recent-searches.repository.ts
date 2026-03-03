import { nowIso } from "@readingos/shared";
import type { CreateRecentSearchInput, RecentSearch } from "@readingos/shared";
import { desc, eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { recentSearchesTable } from "../../db/schema";
import { HttpError } from "../../utils/http-error";

const mapRecentSearchRow = (row: typeof recentSearchesTable.$inferSelect): RecentSearch => ({
  id: row.id,
  query: row.query,
  lang: row.lang as RecentSearch["lang"],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const listRecentSearches = async (): Promise<RecentSearch[]> => {
  const rows = await db.select().from(recentSearchesTable).orderBy(desc(recentSearchesTable.updatedAt)).limit(20);
  return rows.map(mapRecentSearchRow);
};

export const createOrTouchRecentSearch = async (payload: CreateRecentSearchInput): Promise<RecentSearch> => {
  const now = nowIso();

  const [existing] = await db
    .select()
    .from(recentSearchesTable)
    .where(and(eq(recentSearchesTable.query, payload.query.trim()), eq(recentSearchesTable.lang, payload.lang)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(recentSearchesTable)
      .set({ updatedAt: now })
      .where(eq(recentSearchesTable.id, existing.id))
      .returning();

    if (!updated) {
      throw new HttpError(500, "Impossible de mettre à jour la recherche récente");
    }

    return mapRecentSearchRow(updated);
  }

  const [created] = await db
    .insert(recentSearchesTable)
    .values({
      query: payload.query.trim(),
      lang: payload.lang,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!created) {
    throw new HttpError(500, "Impossible de sauvegarder la recherche récente");
  }

  return mapRecentSearchRow(created);
};

export const deleteRecentSearch = async (id: number): Promise<{ ok: boolean; id: number }> => {
  const [deleted] = await db.delete(recentSearchesTable).where(eq(recentSearchesTable.id, id)).returning();

  if (!deleted) {
    throw new HttpError(404, "Recherche récente introuvable");
  }

  return { ok: true, id };
};

export const clearRecentSearches = async (): Promise<{ ok: boolean }> => {
  await db.delete(recentSearchesTable);
  return { ok: true };
};
