import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { nowIso } from "@readingos/shared";
import type {
  AddReadingListItemInput,
  CreateReadingListInput,
  ReadingList,
  ReadingListDetails,
  ReadingListSummary,
  UpdateReadingListInput,
} from "@readingos/shared";
import { db } from "../../db/client";
import { booksTable, libraryItemsTable, readingListItemsTable, readingListsTable } from "../../db/schema";
import { HttpError } from "../../utils/http-error";
import { mapLibraryRowToItem } from "../library/library.mapper";

const mapReadingListRow = (row: typeof readingListsTable.$inferSelect): ReadingList => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  color: row.color ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const requireList = async (id: number) => {
  const [list] = await db.select().from(readingListsTable).where(eq(readingListsTable.id, id)).limit(1);
  if (!list) {
    throw new HttpError(404, "Liste introuvable");
  }
  return list;
};

export const listReadingLists = async (): Promise<ReadingListSummary[]> => {
  const lists = await db.select().from(readingListsTable).orderBy(desc(readingListsTable.updatedAt));

  if (lists.length === 0) {
    return [];
  }

  const listIds = lists.map((list) => list.id);

  const countRows = await db
    .select({
      listId: readingListItemsTable.listId,
      itemCount: sql<number>`count(*)`,
    })
    .from(readingListItemsTable)
    .where(inArray(readingListItemsTable.listId, listIds))
    .groupBy(readingListItemsTable.listId);

  const countByList = new Map<number, number>(countRows.map((row) => [row.listId, Number(row.itemCount)]));

  const previewRows = await db
    .select({
      listId: readingListItemsTable.listId,
      item: libraryItemsTable,
      book: booksTable,
      linkedAt: readingListItemsTable.createdAt,
    })
    .from(readingListItemsTable)
    .innerJoin(libraryItemsTable, eq(readingListItemsTable.libraryItemId, libraryItemsTable.id))
    .innerJoin(booksTable, eq(libraryItemsTable.bookId, booksTable.id))
    .where(inArray(readingListItemsTable.listId, listIds))
    .orderBy(desc(readingListItemsTable.createdAt));

  const previewByList = new Map<number, ReadingListSummary["previewItems"]>();

  for (const row of previewRows) {
    const current = previewByList.get(row.listId) ?? [];
    if (current.length < 4) {
      current.push(mapLibraryRowToItem(row.item, row.book));
      previewByList.set(row.listId, current);
    }
  }

  return lists.map((list) => ({
    ...mapReadingListRow(list),
    itemCount: countByList.get(list.id) ?? 0,
    previewItems: previewByList.get(list.id) ?? [],
  }));
};

export const createReadingList = async (payload: CreateReadingListInput): Promise<ReadingList> => {
  const now = nowIso();
  const [created] = await db
    .insert(readingListsTable)
    .values({
      name: payload.name,
      description: payload.description,
      color: payload.color,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!created) {
    throw new HttpError(500, "Impossible de créer la liste");
  }

  return mapReadingListRow(created);
};

export const getReadingListById = async (id: number): Promise<ReadingListDetails> => {
  const list = await requireList(id);

  const rows = await db
    .select({
      item: libraryItemsTable,
      book: booksTable,
      linkedAt: readingListItemsTable.createdAt,
    })
    .from(readingListItemsTable)
    .innerJoin(libraryItemsTable, eq(readingListItemsTable.libraryItemId, libraryItemsTable.id))
    .innerJoin(booksTable, eq(libraryItemsTable.bookId, booksTable.id))
    .where(eq(readingListItemsTable.listId, id))
    .orderBy(desc(readingListItemsTable.createdAt));

  return {
    ...mapReadingListRow(list),
    items: rows.map((row) => mapLibraryRowToItem(row.item, row.book)),
  };
};

export const updateReadingList = async (id: number, payload: UpdateReadingListInput): Promise<ReadingList> => {
  await requireList(id);

  const [updated] = await db
    .update(readingListsTable)
    .set({
      name: payload.name,
      description: payload.description === undefined ? undefined : payload.description,
      color: payload.color === undefined ? undefined : payload.color,
      updatedAt: nowIso(),
    })
    .where(eq(readingListsTable.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(500, "Impossible de mettre à jour la liste");
  }

  return mapReadingListRow(updated);
};

export const deleteReadingList = async (id: number) => {
  const [removed] = await db.delete(readingListsTable).where(eq(readingListsTable.id, id)).returning();

  if (!removed) {
    throw new HttpError(404, "Liste introuvable");
  }

  return { ok: true, id };
};

export const addItemToReadingList = async (listId: number, payload: AddReadingListItemInput): Promise<ReadingListDetails> => {
  await requireList(listId);

  const [item] = await db.select().from(libraryItemsTable).where(eq(libraryItemsTable.id, payload.libraryItemId)).limit(1);
  if (!item) {
    throw new HttpError(404, "Livre introuvable dans la bibliothèque");
  }

  const existing = await db
    .select()
    .from(readingListItemsTable)
    .where(and(eq(readingListItemsTable.listId, listId), eq(readingListItemsTable.libraryItemId, payload.libraryItemId)))
    .limit(1);

  if (existing[0]) {
    throw new HttpError(409, "Ce livre est déjà dans la liste");
  }

  const now = nowIso();

  await db.insert(readingListItemsTable).values({
    listId,
    libraryItemId: payload.libraryItemId,
    createdAt: now,
  });

  await db.update(readingListsTable).set({ updatedAt: now }).where(eq(readingListsTable.id, listId));

  return getReadingListById(listId);
};

export const removeItemFromReadingList = async (listId: number, libraryItemId: number) => {
  await requireList(listId);

  const [removed] = await db
    .delete(readingListItemsTable)
    .where(and(eq(readingListItemsTable.listId, listId), eq(readingListItemsTable.libraryItemId, libraryItemId)))
    .returning();

  if (!removed) {
    throw new HttpError(404, "Livre introuvable dans cette liste");
  }

  await db.update(readingListsTable).set({ updatedAt: nowIso() }).where(eq(readingListsTable.id, listId));

  return { ok: true, listId, libraryItemId };
};
