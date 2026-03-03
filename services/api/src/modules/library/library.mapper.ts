import type { Book, LibraryItem } from "@readingos/shared";
import type { BookRow, LibraryItemRow } from "../../db/schema";

const parseArray = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const mapBookRowToBook = (row: BookRow): Book => {
  return {
    source: "google",
    sourceId: row.sourceId,
    title: row.title,
    authors: parseArray(row.authors),
    publisher: row.publisher ?? undefined,
    publishedDate: row.publishedDate ?? undefined,
    description: row.description ?? undefined,
    isbn13: row.isbn13 ?? undefined,
    isbn10: row.isbn10 ?? undefined,
    pageCount: row.pageCount ?? undefined,
    categories: row.categories ? parseArray(row.categories) : undefined,
    language: row.language ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    previewLink: row.previewLink ?? undefined,
  };
};

export const mapLibraryRowToItem = (row: LibraryItemRow, book: BookRow): LibraryItem => {
  return {
    id: row.id,
    status: row.status as LibraryItem["status"],
    rating: row.rating ?? undefined,
    review: row.review ?? undefined,
    startedAt: row.startedAt ?? undefined,
    finishedAt: row.finishedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    book: mapBookRowToBook(book),
  };
};
