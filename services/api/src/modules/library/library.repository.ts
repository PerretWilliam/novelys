import { and, desc, eq, like, or, sql } from "drizzle-orm";
import type {
  Book,
  CreateLibraryItemInput,
  LibraryListQuery,
  LibraryStatus,
  UpdateLibraryItemInput,
} from "@readingos/shared";
import { nowIso } from "@readingos/shared";
import { db } from "../../db/client";
import { booksTable, libraryItemsTable } from "../../db/schema";
import { HttpError } from "../../utils/http-error";
import { mapLibraryRowToItem } from "./library.mapper";

const stringifyArray = (value: string[] | undefined): string => JSON.stringify(value ?? []);

const findBookForUpsert = async (book: Book) => {
  if (book.isbn13) {
    const byIsbn = await db.select().from(booksTable).where(eq(booksTable.isbn13, book.isbn13)).limit(1);
    if (byIsbn[0]) {
      return byIsbn[0];
    }
  }

  const bySource = await db
    .select()
    .from(booksTable)
    .where(and(eq(booksTable.source, book.source), eq(booksTable.sourceId, book.sourceId)))
    .limit(1);

  return bySource[0];
};

const insertBook = async (book: Book) => {
  const now = nowIso();
  const [created] = await db
    .insert(booksTable)
    .values({
      source: book.source,
      sourceId: book.sourceId,
      isbn13: book.isbn13,
      isbn10: book.isbn10,
      title: book.title,
      authors: stringifyArray(book.authors),
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      description: book.description,
      pageCount: book.pageCount,
      categories: book.categories ? stringifyArray(book.categories) : null,
      language: book.language,
      thumbnail: book.thumbnail,
      previewLink: book.previewLink,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!created) {
    throw new HttpError(500, "Impossible de creer le livre");
  }

  return created;
};

const getBookWithItem = async (itemId: number) => {
  const rows = await db
    .select({ item: libraryItemsTable, book: booksTable })
    .from(libraryItemsTable)
    .innerJoin(booksTable, eq(libraryItemsTable.bookId, booksTable.id))
    .where(eq(libraryItemsTable.id, itemId))
    .limit(1);

  return rows[0];
};

const assertRatingState = (status: LibraryStatus | undefined, rating: number | null | undefined): void => {
  if (rating === undefined || rating === null) {
    return;
  }

  if (status && status !== "read") {
    throw new HttpError(400, "La note est disponible uniquement pour les livres lus");
  }
};

export const createLibraryItem = async (payload: CreateLibraryItemInput) => {
  assertRatingState(payload.status, payload.rating);

  const existingBook = await findBookForUpsert(payload.book);
  const book = existingBook ?? (await insertBook(payload.book));

  const existingItem = await db
    .select()
    .from(libraryItemsTable)
    .where(eq(libraryItemsTable.bookId, book.id))
    .limit(1);

  if (existingItem[0]) {
    throw new HttpError(409, "Ce livre est deja dans votre bibliotheque");
  }

  const now = nowIso();

  const [item] = await db
    .insert(libraryItemsTable)
    .values({
      bookId: book.id,
      status: payload.status,
      rating: payload.rating,
      review: payload.review,
      startedAt: payload.startedAt,
      finishedAt: payload.finishedAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!item) {
    throw new HttpError(500, "Impossible de creer l'element de bibliotheque");
  }

  return mapLibraryRowToItem(item, book);
};

export const listLibraryItems = async (query: LibraryListQuery) => {
  const conditions = [] as Array<ReturnType<typeof eq> | ReturnType<typeof like> | ReturnType<typeof or>>;

  if (query.status) {
    conditions.push(eq(libraryItemsTable.status, query.status));
  }

  if (query.query) {
    const needle = `%${query.query.toLowerCase()}%`;
    conditions.push(
      or(like(sql`LOWER(${booksTable.title})`, needle), like(sql`LOWER(${booksTable.authors})`, needle)) as ReturnType<
        typeof or
      >,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({ item: libraryItemsTable, book: booksTable })
    .from(libraryItemsTable)
    .innerJoin(booksTable, eq(libraryItemsTable.bookId, booksTable.id))
    .where(where)
    .orderBy(desc(libraryItemsTable.updatedAt))
    .limit(query.limit)
    .offset(query.offset);

  return rows.map((row) => mapLibraryRowToItem(row.item, row.book));
};

export const getLibraryItemById = async (id: number) => {
  const row = await getBookWithItem(id);

  if (!row) {
    throw new HttpError(404, "Element de bibliotheque introuvable");
  }

  return mapLibraryRowToItem(row.item, row.book);
};

export const updateLibraryItem = async (id: number, payload: UpdateLibraryItemInput) => {
  const existing = await getBookWithItem(id);

  if (!existing) {
    throw new HttpError(404, "Element de bibliotheque introuvable");
  }

  const nextStatus = payload.status ?? (existing.item.status as LibraryStatus);
  assertRatingState(nextStatus, payload.rating ?? undefined);

  const [updated] = await db
    .update(libraryItemsTable)
    .set({
      status: payload.status,
      rating: payload.rating === undefined ? undefined : payload.rating,
      review: payload.review === undefined ? undefined : payload.review,
      startedAt: payload.startedAt === undefined ? undefined : payload.startedAt,
      finishedAt: payload.finishedAt === undefined ? undefined : payload.finishedAt,
      updatedAt: nowIso(),
    })
    .where(eq(libraryItemsTable.id, id))
    .returning();

  if (!updated) {
    throw new HttpError(500, "Impossible de mettre a jour l'element de bibliotheque");
  }

  return mapLibraryRowToItem(updated, existing.book);
};

export const deleteLibraryItem = async (id: number) => {
  const [removed] = await db.delete(libraryItemsTable).where(eq(libraryItemsTable.id, id)).returning();

  if (!removed) {
    throw new HttpError(404, "Element de bibliotheque introuvable");
  }

  return { ok: true, id };
};
