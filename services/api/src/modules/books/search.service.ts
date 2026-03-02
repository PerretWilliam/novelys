import type { Book, SearchQuery } from "@readingos/shared";
import { searchGoogleBooks } from "./google-books-client";
import { normalizeGoogleBook, rankBooks } from "./book-normalizer";

export const searchBooks = async (query: SearchQuery): Promise<Book[]> => {
  const items = await searchGoogleBooks(query);
  const normalized = items
    .map(normalizeGoogleBook)
    .filter((value): value is Book => Boolean(value));

  return rankBooks(normalized);
};
