import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { booksTable, libraryItemsTable } from "../../db/schema";

export const getLibraryStats = async () => {
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(libraryItemsTable);
  const [read] = await db
    .select({ count: sql<number>`count(*)` })
    .from(libraryItemsTable)
    .where(eq(libraryItemsTable.status, "read"));
  const [reading] = await db
    .select({ count: sql<number>`count(*)` })
    .from(libraryItemsTable)
    .where(eq(libraryItemsTable.status, "reading"));

  const [rating] = await db
    .select({ avg: sql<number>`coalesce(avg(${libraryItemsTable.rating}), 0)` })
    .from(libraryItemsTable)
    .where(and(eq(libraryItemsTable.status, "read"), isNotNull(libraryItemsTable.rating)));

  const [pages] = await db
    .select({ pages: sql<number>`coalesce(sum(${booksTable.pageCount}), 0)` })
    .from(libraryItemsTable)
    .innerJoin(booksTable, eq(libraryItemsTable.bookId, booksTable.id))
    .where(eq(libraryItemsTable.status, "read"));

  return {
    totalItems: total?.count ?? 0,
    totalRead: read?.count ?? 0,
    totalReading: reading?.count ?? 0,
    averageRating: Number((rating?.avg ?? 0).toFixed(2)),
    pagesRead: pages?.pages ?? 0,
  };
};
