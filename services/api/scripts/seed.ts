import { nowIso } from "@readingos/shared";
import { bootstrapDatabase } from "../src/db/bootstrap";
import { rawDb } from "../src/db/client";

type SeedBook = {
  sourceId: string;
  title: string;
  authors: string[];
  description: string;
  language: "fr" | "en";
  pageCount: number;
  publishedDate: string;
  thumbnail: string;
  categories?: string[];
  isbn13?: string;
};

type SeedLibraryItem = {
  sourceId: string;
  status: "to_read" | "reading" | "read" | "abandoned";
  rating?: number;
  review?: string;
  startedAt?: string;
  finishedAt?: string;
};

type SeedList = {
  name: string;
  description?: string;
  color?: string;
  items: string[];
};

const daysAgoIso = (days: number): string => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const BOOKS: SeedBook[] = [
  {
    sourceId: "seed-atomic-habits",
    title: "Atomic Habits",
    authors: ["James Clear"],
    description: "Small habits, remarkable results.",
    language: "en",
    pageCount: 320,
    publishedDate: "2018-10-16",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    categories: ["Productivity", "Self-help"],
    isbn13: "9780735211292",
  },
  {
    sourceId: "seed-clean-code",
    title: "Clean Code",
    authors: ["Robert C. Martin"],
    description: "A handbook of agile software craftsmanship.",
    language: "en",
    pageCount: 464,
    publishedDate: "2008-08-01",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    categories: ["Software Engineering"],
    isbn13: "9780132350884",
  },
  {
    sourceId: "seed-deep-work",
    title: "Deep Work",
    authors: ["Cal Newport"],
    description: "Rules for focused success in a distracted world.",
    language: "en",
    pageCount: 304,
    publishedDate: "2016-01-05",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
    categories: ["Productivity"],
    isbn13: "9781455586691",
  },
  {
    sourceId: "seed-petit-prince",
    title: "Le Petit Prince",
    authors: ["Antoine de Saint-Exupery"],
    description: "Conte poetique et philosophique.",
    language: "fr",
    pageCount: 128,
    publishedDate: "1943-04-06",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9782070612758-L.jpg",
    categories: ["Roman"],
    isbn13: "9782070612758",
  },
  {
    sourceId: "seed-sapiens",
    title: "Sapiens",
    authors: ["Yuval Noah Harari"],
    description: "Une breve histoire de l'humanite.",
    language: "fr",
    pageCount: 512,
    publishedDate: "2015-09-01",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9782226257017-L.jpg",
    categories: ["Histoire"],
    isbn13: "9782226257017",
  },
  {
    sourceId: "seed-dune",
    title: "Dune",
    authors: ["Frank Herbert"],
    description: "Epic science-fiction novel.",
    language: "en",
    pageCount: 688,
    publishedDate: "1965-08-01",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    categories: ["Science Fiction"],
    isbn13: "9780441172719",
  },
  {
    sourceId: "seed-l-etranger",
    title: "L'Etranger",
    authors: ["Albert Camus"],
    description: "Roman majeur du XXe siecle.",
    language: "fr",
    pageCount: 192,
    publishedDate: "1942-01-01",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9782070360024-L.jpg",
    categories: ["Roman"],
    isbn13: "9782070360024",
  },
  {
    sourceId: "seed-thinking-fast-slow",
    title: "Thinking, Fast and Slow",
    authors: ["Daniel Kahneman"],
    description: "How we think and decide.",
    language: "en",
    pageCount: 512,
    publishedDate: "2011-10-25",
    thumbnail: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
    categories: ["Psychology"],
    isbn13: "9780374533557",
  },
];

const LIBRARY_ITEMS: SeedLibraryItem[] = [
  {
    sourceId: "seed-atomic-habits",
    status: "read",
    rating: 4.5,
    review: "Tres concret et actionnable.",
    startedAt: daysAgoIso(25),
    finishedAt: daysAgoIso(20),
  },
  {
    sourceId: "seed-clean-code",
    status: "reading",
    startedAt: daysAgoIso(7),
  },
  {
    sourceId: "seed-deep-work",
    status: "to_read",
  },
  {
    sourceId: "seed-petit-prince",
    status: "read",
    rating: 5,
    review: "Intemporel.",
    startedAt: daysAgoIso(60),
    finishedAt: daysAgoIso(58),
  },
  {
    sourceId: "seed-sapiens",
    status: "abandoned",
    review: "Je reprendrai plus tard.",
    startedAt: daysAgoIso(45),
  },
  {
    sourceId: "seed-dune",
    status: "read",
    rating: 4,
    startedAt: daysAgoIso(80),
    finishedAt: daysAgoIso(70),
  },
];

const LISTS: SeedList[] = [
  {
    name: "A lire ce mois-ci",
    description: "Selection prioritaire",
    color: "#0F4C81",
    items: ["seed-clean-code", "seed-deep-work"],
  },
  {
    name: "Favoris",
    description: "Mes indispensables",
    color: "#F59E0B",
    items: ["seed-atomic-habits", "seed-petit-prince", "seed-dune"],
  },
];

const RECENT_SEARCHES = [
  { query: "productivite", lang: "fr" as const },
  { query: "clean architecture", lang: "en" as const },
  { query: "roman classique", lang: "fr" as const },
];

const main = async (): Promise<void> => {
  await bootstrapDatabase();

  const run = rawDb.transaction(() => {
    rawDb.prepare("DELETE FROM reading_list_items").run();
    rawDb.prepare("DELETE FROM reading_lists").run();
    rawDb.prepare("DELETE FROM library_items").run();
    rawDb.prepare("DELETE FROM books").run();
    rawDb.prepare("DELETE FROM recent_searches").run();
    rawDb
      .prepare(
        "DELETE FROM sqlite_sequence WHERE name IN ('reading_list_items', 'reading_lists', 'library_items', 'books', 'recent_searches')",
      )
      .run();

    const prefNow = nowIso();
    rawDb
      .prepare(
        `
        INSERT INTO user_preferences (id, search_lang, theme_mode, updated_at)
        VALUES (1, 'fr', 'system', ?)
        ON CONFLICT(id) DO UPDATE SET
          search_lang = excluded.search_lang,
          theme_mode = excluded.theme_mode,
          updated_at = excluded.updated_at
      `,
      )
      .run(prefNow);

    const insertBook = rawDb.prepare(
      `
      INSERT INTO books (
        source, source_id, isbn13, isbn10, title, authors, publisher, published_date, description,
        page_count, categories, language, thumbnail, preview_link, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    );
    const insertLibraryItem = rawDb.prepare(
      `
      INSERT INTO library_items (
        book_id, status, rating, review, started_at, finished_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    );
    const insertList = rawDb.prepare(
      `
      INSERT INTO reading_lists (name, description, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    );
    const insertListItem = rawDb.prepare(
      `
      INSERT INTO reading_list_items (list_id, library_item_id, created_at)
      VALUES (?, ?, ?)
    `,
    );
    const insertRecentSearch = rawDb.prepare(
      `
      INSERT INTO recent_searches (query, lang, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `,
    );

    const bookIds = new Map<string, number>();
    for (const book of BOOKS) {
      const createdAt = daysAgoIso(90);
      const result = insertBook.run(
        "google",
        book.sourceId,
        book.isbn13 ?? null,
        null,
        book.title,
        JSON.stringify(book.authors),
        null,
        book.publishedDate,
        book.description,
        book.pageCount,
        book.categories ? JSON.stringify(book.categories) : null,
        book.language,
        book.thumbnail,
        null,
        createdAt,
        createdAt,
      );
      bookIds.set(book.sourceId, Number(result.lastInsertRowid));
    }

    const libraryItemIds = new Map<string, number>();
    for (const item of LIBRARY_ITEMS) {
      const bookId = bookIds.get(item.sourceId);
      if (!bookId) {
        throw new Error(`Book not found for sourceId=${item.sourceId}`);
      }
      const createdAt = item.startedAt ?? nowIso();
      const updatedAt = item.finishedAt ?? nowIso();
      const result = insertLibraryItem.run(
        bookId,
        item.status,
        item.rating ?? null,
        item.review ?? null,
        item.startedAt ?? null,
        item.finishedAt ?? null,
        createdAt,
        updatedAt,
      );
      libraryItemIds.set(item.sourceId, Number(result.lastInsertRowid));
    }

    for (const list of LISTS) {
      const now = nowIso();
      const listResult = insertList.run(list.name, list.description ?? null, list.color ?? null, now, now);
      const listId = Number(listResult.lastInsertRowid);
      for (const sourceId of list.items) {
        const libraryItemId = libraryItemIds.get(sourceId);
        if (!libraryItemId) {
          throw new Error(`Library item not found for sourceId=${sourceId}`);
        }
        insertListItem.run(listId, libraryItemId, now);
      }
    }

    for (const recent of RECENT_SEARCHES) {
      const now = nowIso();
      insertRecentSearch.run(recent.query, recent.lang, now, now);
    }
  });

  run();

  const booksCount = rawDb.prepare("SELECT count(*) as count FROM books").get() as { count: number };
  const itemsCount = rawDb.prepare("SELECT count(*) as count FROM library_items").get() as { count: number };
  const listsCount = rawDb.prepare("SELECT count(*) as count FROM reading_lists").get() as { count: number };
  const listItemsCount = rawDb.prepare("SELECT count(*) as count FROM reading_list_items").get() as { count: number };
  const searchesCount = rawDb.prepare("SELECT count(*) as count FROM recent_searches").get() as { count: number };

  // eslint-disable-next-line no-console
  console.log(
    `Seed done: books=${booksCount.count}, library_items=${itemsCount.count}, lists=${listsCount.count}, list_items=${listItemsCount.count}, recent_searches=${searchesCount.count}`,
  );
};

void main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", error);
  process.exit(1);
});
