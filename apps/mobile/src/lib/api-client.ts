import type {
  AddReadingListItemInput,
  Book,
  CreateReadingListInput,
  CreateLibraryItemInput,
  CreateRecentSearchInput,
  LibraryItem,
  LibraryListQuery,
  Preferences,
  RecentSearch,
  ReadingList,
  ReadingListDetails,
  ReadingListSummary,
  SearchQuery,
  Stats,
  UpdatePreferencesInput,
  UpdateReadingListInput,
  UpdateLibraryItemInput,
} from "@readingos/shared";

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: response.statusText }))) as { message?: string };
    throw new Error(body.message ?? "Requête impossible");
  }

  return (await response.json()) as T;
};

export const buildApiClient = (baseUrl: string) => {
  const api = `${baseUrl}/api`;

  return {
    searchBooks: (query: SearchQuery) => {
      const params = new URLSearchParams({ q: query.q, limit: String(query.limit) });
      if (query.lang) {
        params.set("lang", query.lang);
      }
      return request<Book[]>(`${api}/search?${params.toString()}`);
    },
    listLibrary: (query: LibraryListQuery) => {
      const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset) });
      if (query.status) {
        params.set("status", query.status);
      }
      if (query.query) {
        params.set("query", query.query);
      }
      return request<LibraryItem[]>(`${api}/library?${params.toString()}`);
    },
    createLibraryItem: (payload: CreateLibraryItemInput) => {
      return request<LibraryItem>(`${api}/library`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateLibraryItem: (id: number, payload: UpdateLibraryItemInput) => {
      return request<LibraryItem>(`${api}/library/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deleteLibraryItem: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/library/${id}`, {
        method: "DELETE",
      });
    },
    listReadingLists: () => request<ReadingListSummary[]>(`${api}/lists`),
    createReadingList: (payload: CreateReadingListInput) => {
      return request<ReadingList>(`${api}/lists`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getReadingList: (id: number) => request<ReadingListDetails>(`${api}/lists/${id}`),
    updateReadingList: (id: number, payload: UpdateReadingListInput) => {
      return request<ReadingList>(`${api}/lists/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deleteReadingList: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/lists/${id}`, {
        method: "DELETE",
      });
    },
    addReadingListItem: (listId: number, payload: AddReadingListItemInput) => {
      return request<ReadingListDetails>(`${api}/lists/${listId}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    removeReadingListItem: (listId: number, libraryItemId: number) => {
      return request<{ ok: boolean; listId: number; libraryItemId: number }>(`${api}/lists/${listId}/items/${libraryItemId}`, {
        method: "DELETE",
      });
    },
    getPreferences: () => request<Preferences>(`${api}/preferences`),
    updatePreferences: (payload: UpdatePreferencesInput) => {
      return request<Preferences>(`${api}/preferences`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    listRecentSearches: () => request<RecentSearch[]>(`${api}/recent-searches`),
    createRecentSearch: (payload: CreateRecentSearchInput) => {
      return request<RecentSearch>(`${api}/recent-searches`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    deleteRecentSearch: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/recent-searches/${id}`, {
        method: "DELETE",
      });
    },
    clearRecentSearches: () => {
      return request<{ ok: boolean }>(`${api}/recent-searches`, {
        method: "DELETE",
      });
    },
    getStats: () => request<Stats>(`${api}/stats`),
  };
};
