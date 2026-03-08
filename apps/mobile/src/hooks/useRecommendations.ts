import type { Book } from "@readingos/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLibrary } from "../contexts/LibraryContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { useReadingLists } from "../contexts/ReadingListsContext";
import { useApiClient } from "./useApiClient";

type RecommendationSource = {
  recommendedForYou: Book[];
  exploreBooks: Book[];
  isLoading: boolean;
  error: string | null;
  hasPersonalSignals: boolean;
  refresh: () => Promise<void>;
};

const normalize = (value: string) => value.trim().toLowerCase();

const pickSeedQueries = (items: { book: Book }[], listNames: string[]) => {
  const categories = new Map<string, number>();
  const authors = new Map<string, number>();
  const titleTokens = new Map<string, number>();

  for (const item of items) {
    for (const category of item.book.categories ?? []) {
      const key = normalize(category);
      if (key.length >= 3) {
        categories.set(category, (categories.get(category) ?? 0) + 1);
      }
    }
    for (const author of item.book.authors) {
      const key = normalize(author);
      if (key.length >= 3) {
        authors.set(author, (authors.get(author) ?? 0) + 1);
      }
    }
    for (const rawToken of item.book.title.split(/\s+/)) {
      const token = normalize(rawToken.replace(/[^\p{L}\p{N}-]/gu, ""));
      if (token.length >= 4) {
        titleTokens.set(token, (titleTokens.get(token) ?? 0) + 1);
      }
    }
  }

  const sortEntries = (map: Map<string, number>) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => value);

  const topCategories = sortEntries(categories).slice(0, 2);
  const topAuthors = sortEntries(authors).slice(0, 2);
  const topTitleTokens = sortEntries(titleTokens).slice(0, 2);
  const topListNames = listNames.map((name) => name.trim()).filter((name) => name.length >= 3).slice(0, 1);

  const seeds = [...topCategories, ...topAuthors, ...topTitleTokens, ...topListNames].slice(0, 4);
  return Array.from(new Set(seeds));
};

const dedupeBooks = (books: Book[]) =>
  books.reduce<Book[]>((acc, book) => {
    if (!acc.some((entry) => entry.sourceId === book.sourceId)) {
      acc.push(book);
    }
    return acc;
  }, []);

const languagePrefix = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const [prefix] = normalized.split(/[-_]/);
  return prefix || null;
};

const preferProfileLanguage = (books: Book[], lang: "fr" | "en"): Book[] => {
  const preferred: Book[] = [];
  const others: Book[] = [];

  for (const book of books) {
    const prefix = languagePrefix(book.language);
    if (prefix === lang) {
      preferred.push(book);
    } else {
      others.push(book);
    }
  }

  return [...preferred, ...others];
};

const parsePublishedDateScore = (value?: string): number => {
  if (!value) {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  if (/^\d{4}$/.test(trimmed)) {
    return Number(trimmed) * 10_000;
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const ts = Date.parse(`${trimmed}-01T00:00:00.000Z`);
    return Number.isNaN(ts) ? 0 : ts;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ts = Date.parse(`${trimmed}T00:00:00.000Z`);
    return Number.isNaN(ts) ? 0 : ts;
  }

  const ts = Date.parse(trimmed);
  return Number.isNaN(ts) ? 0 : ts;
};

const DEFAULT_PERSONAL_QUERIES = ["roman contemporain", "science-fiction", "thriller psychologique", "fantasy"];
const EXPLORE_QUERIES = ["classiques français", "prix littéraires", "biographies inspirantes", "mangas populaires"];
const QUERY_LIMIT = 20;
const MAX_RECOMMENDED = 80;
const MAX_EXPLORE = 120;

export const useRecommendations = (): RecommendationSource => {
  const api = useApiClient();
  const { items } = useLibrary();
  const { lists } = useReadingLists();
  const { searchLang, isLoading: isPreferencesLoading } = usePreferences();
  const [recommendedForYou, setRecommendedForYou] = useState<Book[]>([]);
  const [exploreBooks, setExploreBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNames = useMemo(() => lists.map((list) => list.name), [lists]);
  const hasPersonalSignals = items.length > 0 || listNames.length > 0;

  const refresh = useCallback(async () => {
    if (isPreferencesLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const seeds = pickSeedQueries(items, listNames);
      const personalQueries = seeds.length > 0 ? seeds : DEFAULT_PERSONAL_QUERIES;

      const [personalResponses, exploreResponses] = await Promise.all([
        Promise.all(personalQueries.map((q) => api.searchBooks({ q, lang: searchLang, limit: QUERY_LIMIT }))),
        Promise.all(EXPLORE_QUERIES.map((q) => api.searchBooks({ q, lang: searchLang, limit: QUERY_LIMIT }))),
      ]);

      const existingIds = new Set(items.map((item) => item.book.sourceId));
      const personal = preferProfileLanguage(
        dedupeBooks(personalResponses.flat().filter((book) => !existingIds.has(book.sourceId))),
        searchLang,
      ).slice(0, MAX_RECOMMENDED);
      const personalIds = new Set(personal.map((book) => book.sourceId));

      const explore = preferProfileLanguage(
        dedupeBooks(
          exploreResponses
            .flat()
            .filter((book) => !existingIds.has(book.sourceId) && !personalIds.has(book.sourceId)),
        ).sort((a, b) => parsePublishedDateScore(b.publishedDate) - parsePublishedDateScore(a.publishedDate)),
        searchLang,
      ).slice(0, MAX_EXPLORE);

      setRecommendedForYou(personal);
      setExploreBooks(explore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les recommandations");
    } finally {
      setIsLoading(false);
    }
  }, [api, isPreferencesLoading, items, listNames, searchLang]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    recommendedForYou,
    exploreBooks,
    isLoading,
    error,
    hasPersonalSignals,
    refresh,
  };
};
