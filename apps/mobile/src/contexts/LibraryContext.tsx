import type { CreateLibraryItemInput, LibraryItem, LibraryStatus, UpdateLibraryItemInput } from "@readingos/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";

type LibraryValue = {
  items: LibraryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: (status?: LibraryStatus, query?: string) => Promise<void>;
  addBook: (payload: CreateLibraryItemInput) => Promise<LibraryItem>;
  updateItem: (id: number, payload: UpdateLibraryItemInput) => Promise<LibraryItem>;
  removeItem: (id: number) => Promise<void>;
  getById: (id: number) => LibraryItem | undefined;
};

const LibraryContext = createContext<LibraryValue | null>(null);

export const LibraryProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiClient();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (status?: LibraryStatus, query?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const next = await api.listLibrary({ status, query, limit: 100, offset: 0 });
        setItems(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger la bibliothèque");
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addBook = useCallback(
    async (payload: CreateLibraryItemInput) => {
      const item = await api.createLibraryItem(payload);
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [api],
  );

  const updateItem = useCallback(
    async (id: number, payload: UpdateLibraryItemInput) => {
      const item = await api.updateLibraryItem(id, payload);
      setItems((prev) => prev.map((entry) => (entry.id === id ? item : entry)));
      return item;
    },
    [api],
  );

  const removeItem = useCallback(
    async (id: number) => {
      await api.deleteLibraryItem(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
    },
    [api],
  );

  const getById = useCallback((id: number) => items.find((entry) => entry.id === id), [items]);

  const value = useMemo(
    () => ({ items, isLoading, error, refresh, addBook, updateItem, removeItem, getById }),
    [items, isLoading, error, refresh, addBook, updateItem, removeItem, getById],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryValue => {
  const value = useContext(LibraryContext);
  if (!value) {
    throw new Error("useLibrary doit être utilisé dans LibraryProvider");
  }
  return value;
};
