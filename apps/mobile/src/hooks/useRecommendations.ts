import type { Book } from "@readingos/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLibrary } from "../contexts/LibraryContext";
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

const DEFAULT_PERSONAL_QUERIES = ["roman contemporain", "science-fiction", "thriller psychologique", "fantasy"];
const EXPLORE_QUERIES = ["classiques français", "prix littéraires", "biographies inspirantes", "mangas populaires"];

export const useRecommendations = (): RecommendationSource => {
  const api = useApiClient();
  const { items } = useLibrary();
  const { lists } = useReadingLists();
  const [recommendedForYou, setRecommendedForYou] = useState<Book[]>([]);
  const [exploreBooks, setExploreBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listNames = useMemo(() => lists.map((list) => list.name), [lists]);
  const hasPersonalSignals = items.length > 0 || listNames.length > 0;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const seeds = pickSeedQueries(items, listNames);
      const personalQueries = seeds.length > 0 ? seeds : DEFAULT_PERSONAL_QUERIES;

      const [personalResponses, exploreResponses] = await Promise.all([
        Promise.all(personalQueries.map((q) => api.searchBooks({ q, limit: 8 }))),
        Promise.all(EXPLORE_QUERIES.map((q) => api.searchBooks({ q, limit: 8 }))),
      ]);

      const existingIds = new Set(items.map((item) => item.book.sourceId));
      const personal = dedupeBooks(personalResponses.flat().filter((book) => !existingIds.has(book.sourceId))).slice(0, 12);
      const personalIds = new Set(personal.map((book) => book.sourceId));

      const explore = dedupeBooks(
        exploreResponses
          .flat()
          .filter((book) => !existingIds.has(book.sourceId) && !personalIds.has(book.sourceId)),
      ).slice(0, 12);

      setRecommendedForYou(personal);
      setExploreBooks(explore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les recommandations");
    } finally {
      setIsLoading(false);
    }
  }, [api, items, listNames]);

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
