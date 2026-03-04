import type {
  CreateReadingListInput,
  ReadingListDetails,
  ReadingListSummary,
  UpdateReadingListInput,
} from "@readingos/shared";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";

type ReadingListsValue = {
  lists: ReadingListSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createList: (payload: CreateReadingListInput) => Promise<void>;
  updateList: (id: number, payload: UpdateReadingListInput) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  getList: (id: number) => Promise<ReadingListDetails>;
  addItem: (listId: number, libraryItemId: number) => Promise<ReadingListDetails>;
  removeItem: (listId: number, libraryItemId: number) => Promise<void>;
};

const ReadingListsContext = createContext<ReadingListsValue | null>(null);

export const ReadingListsProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApiClient();
  const [lists, setLists] = useState<ReadingListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await api.listReadingLists();
      setLists(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les listes");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createList = useCallback(
    async (payload: CreateReadingListInput) => {
      await api.createReadingList(payload);
      await refresh();
    },
    [api, refresh],
  );

  const updateList = useCallback(
    async (id: number, payload: UpdateReadingListInput) => {
      await api.updateReadingList(id, payload);
      await refresh();
    },
    [api, refresh],
  );

  const deleteList = useCallback(
    async (id: number) => {
      await api.deleteReadingList(id);
      await refresh();
    },
    [api, refresh],
  );

  const getList = useCallback(
    async (id: number) => {
      return api.getReadingList(id);
    },
    [api],
  );

  const addItem = useCallback(
    async (listId: number, libraryItemId: number) => {
      const details = await api.addReadingListItem(listId, { libraryItemId });
      await refresh();
      return details;
    },
    [api, refresh],
  );

  const removeItem = useCallback(
    async (listId: number, libraryItemId: number) => {
      await api.removeReadingListItem(listId, libraryItemId);
      await refresh();
    },
    [api, refresh],
  );

  const value = useMemo(
    () => ({ lists, isLoading, error, refresh, createList, updateList, deleteList, getList, addItem, removeItem }),
    [lists, isLoading, error, refresh, createList, updateList, deleteList, getList, addItem, removeItem],
  );

  return <ReadingListsContext.Provider value={value}>{children}</ReadingListsContext.Provider>;
};

export const useReadingLists = (): ReadingListsValue => {
  const value = useContext(ReadingListsContext);
  if (!value) {
    throw new Error("useReadingLists doit être utilisé dans ReadingListsProvider");
  }
  return value;
};
