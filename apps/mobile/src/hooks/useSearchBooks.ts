import type { Book } from "@readingos/shared";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import { useApiClient } from "./useApiClient";
import { useDebouncedValue } from "./useDebouncedValue";

const INITIAL_LIMIT = 8;
const PAGE_SIZE = 8;
const MAX_LIMIT = 48;

export const useSearchBooks = () => {
  const api = useApiClient();
  const { searchLang, setSearchLang } = usePreferences();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      setLimit(INITIAL_LIMIT);
      setHasMore(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSuggesting(true);

    void api
      .searchBooks({ q: debouncedQuery, lang: searchLang, limit })
      .then((books) => {
        if (requestId === requestIdRef.current) {
          setSuggestions(books);
          setHasMore(books.length >= limit && limit < MAX_LIMIT);
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsSuggesting(false);
        }
      });
  }, [api, debouncedQuery, limit, searchLang]);

  useEffect(() => {
    setLimit(INITIAL_LIMIT);
  }, [debouncedQuery, searchLang]);

  const loadMore = () => {
    if (isSuggesting || !hasMore) {
      return;
    }
    setLimit((prev) => Math.min(prev + PAGE_SIZE, MAX_LIMIT));
  };

  return {
    query,
    setQuery,
    lang: searchLang,
    setLang: setSearchLang,
    suggestions,
    isSuggesting,
    hasMore,
    loadMore,
  };
};
