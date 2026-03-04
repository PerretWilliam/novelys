import type { Book, SearchLang } from "@readingos/shared";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "../contexts/PreferencesContext";
import { useApiClient } from "./useApiClient";
import { useDebouncedValue } from "./useDebouncedValue";

export const useSearchBooks = () => {
  const api = useApiClient();
  const { searchLang, setSearchLang } = usePreferences();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsSuggesting(true);

    void api
      .searchBooks({ q: debouncedQuery, lang: searchLang, limit: 6 })
      .then((books) => {
        if (requestId === requestIdRef.current) {
          setSuggestions(books);
        }
      })
      .catch(() => {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsSuggesting(false);
        }
      });
  }, [api, debouncedQuery, searchLang]);

  const runSearch = async (nextQuery?: string, langOverride?: SearchLang): Promise<string | null> => {
    const finalQuery = (nextQuery ?? query).trim();
    if (!finalQuery) {
      return null;
    }
    const finalLang = langOverride ?? searchLang;

    setIsLoading(true);
    setError(null);

    try {
      const next = await api.searchBooks({ q: finalQuery, lang: finalLang, limit: 20 });
      setResults(next);
      setQuery(finalQuery);
      setSuggestions([]);
      return finalQuery;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recherche impossible");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    setQuery,
    lang: searchLang,
    setLang: setSearchLang,
    results,
    suggestions,
    isSuggesting,
    isLoading,
    error,
    runSearch,
  };
};
