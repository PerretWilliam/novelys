import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const booksTable = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source").notNull(),
    sourceId: text("source_id").notNull(),
    isbn13: text("isbn13"),
    isbn10: text("isbn10"),
    title: text("title").notNull(),
    authors: text("authors").notNull(),
    publisher: text("publisher"),
    publishedDate: text("published_date"),
    description: text("description"),
    pageCount: integer("page_count"),
    categories: text("categories"),
    language: text("language"),
    thumbnail: text("thumbnail"),
    previewLink: text("preview_link"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("books_source_source_id_unique").on(table.source, table.sourceId),
    uniqueIndex("books_isbn13_unique").on(table.isbn13),
  ],
);

export const libraryItemsTable = sqliteTable(
  "library_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id")
      .notNull()
      .references(() => booksTable.id, { onDelete: "restrict" }),
    status: text("status").notNull(),
    rating: integer("rating"),
    review: text("review"),
    startedAt: text("started_at"),
    finishedAt: text("finished_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("library_items_status_idx").on(table.status),
    index("library_items_book_id_idx").on(table.bookId),
    check("library_items_rating_range_chk", sql`rating IS NULL OR (rating BETWEEN 1 AND 5)`),
  ],
);

export const readingListsTable = sqliteTable(
  "reading_lists",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("reading_lists_updated_at_idx").on(table.updatedAt)],
);

export const readingListItemsTable = sqliteTable(
  "reading_list_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    listId: integer("list_id")
      .notNull()
      .references(() => readingListsTable.id, { onDelete: "cascade" }),
    libraryItemId: integer("library_item_id")
      .notNull()
      .references(() => libraryItemsTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("reading_list_items_unique").on(table.listId, table.libraryItemId),
    index("reading_list_items_list_id_idx").on(table.listId),
    index("reading_list_items_library_item_id_idx").on(table.libraryItemId),
  ],
);

export const userPreferencesTable = sqliteTable("user_preferences", {
  id: integer("id").primaryKey(),
  searchLang: text("search_lang").notNull(),
  themeMode: text("theme_mode").notNull(),
  showCovers: integer("show_covers").notNull(),
  compactMode: integer("compact_mode").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recentSearchesTable = sqliteTable(
  "recent_searches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    query: text("query").notNull(),
    lang: text("lang").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("recent_searches_query_lang_unique").on(table.query, table.lang),
    index("recent_searches_updated_at_idx").on(table.updatedAt),
  ],
);

export type BookRow = typeof booksTable.$inferSelect;
export type NewBookRow = typeof booksTable.$inferInsert;
export type LibraryItemRow = typeof libraryItemsTable.$inferSelect;
export type NewLibraryItemRow = typeof libraryItemsTable.$inferInsert;
export type ReadingListRow = typeof readingListsTable.$inferSelect;
export type NewReadingListRow = typeof readingListsTable.$inferInsert;
export type ReadingListItemRow = typeof readingListItemsTable.$inferSelect;
export type NewReadingListItemRow = typeof readingListItemsTable.$inferInsert;
export type UserPreferencesRow = typeof userPreferencesTable.$inferSelect;
export type NewUserPreferencesRow = typeof userPreferencesTable.$inferInsert;
export type RecentSearchRow = typeof recentSearchesTable.$inferSelect;
export type NewRecentSearchRow = typeof recentSearchesTable.$inferInsert;
