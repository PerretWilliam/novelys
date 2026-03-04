import type { SearchLang } from "@readingos/shared";
import type { RecentSearch } from "@readingos/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";

type RecentSearchesValue = {
  searches: RecentSearch[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addSearch: (query: string, lang: SearchLang) => void;
  removeSearch: (id: number) => void;
  clearSearches: () => void;
};

const RecentSearchesContext = createContext<RecentSearchesValue | null>(null);

export const RecentSearchesProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiClient();
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recent = await api.listRecentSearches();
      setSearches(recent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les recherches récentes");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addSearch = useCallback((query: string, lang: SearchLang) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return;
    }

    void api
      .createRecentSearch({ query: normalizedQuery, lang })
      .then(() => refresh())
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Impossible de sauvegarder la recherche");
      });
  }, [api, refresh]);

  const removeSearch = useCallback((id: number) => {
    void api
      .deleteRecentSearch(id)
      .then(() => refresh())
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Impossible de supprimer la recherche");
      });
  }, [api, refresh]);

  const clearSearches = useCallback(() => {
    void api
      .clearRecentSearches()
      .then(() => refresh())
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Impossible d'effacer les recherches");
      });
  }, [api, refresh]);

  const value = useMemo(
    () => ({
      searches,
      isLoading,
      error,
      refresh,
      addSearch,
      removeSearch,
      clearSearches,
    }),
    [searches, isLoading, error, refresh, addSearch, removeSearch, clearSearches],
  );

  return <RecentSearchesContext.Provider value={value}>{children}</RecentSearchesContext.Provider>;
};

export const useRecentSearches = () => {
  const value = useContext(RecentSearchesContext);
  if (!value) {
    throw new Error("useRecentSearches doit être utilisé dans RecentSearchesProvider");
  }
  return value;
};
