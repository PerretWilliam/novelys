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

const translateApiMessage = (message: string): string => {
  const normalized = message.trim();

  const mappings: Array<{ match: RegExp; value: string }> = [
    { match: /^Validation error$/i, value: "Erreur de validation" },
    { match: /^At least one field must be provided$/i, value: "Au moins un champ doit etre fourni." },
    { match: /^Internal server error$/i, value: "Erreur interne du serveur" },
    { match: /^Unexpected error$/i, value: "Erreur inattendue" },
    { match: /^Network request failed$/i, value: "Connexion au serveur impossible" },
    { match: /^Failed to fetch$/i, value: "Connexion au serveur impossible" },
  ];

  const found = mappings.find((mapping) => mapping.match.test(normalized));
  return found ? found.value : normalized;
};

const request = async <T>(url: string, apiToken: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (apiToken) {
    headers.set("Authorization", `Bearer ${apiToken}`);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({ message: response.statusText }))) as {
        message?: string;
      };
      const message = body.message ? translateApiMessage(body.message) : "Requete impossible";
      throw new Error(message);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(translateApiMessage(error.message));
    }
    throw new Error("Requete impossible");
  }
};

export const buildApiClient = (baseUrl: string, apiToken: string = "") => {
  const api = `${baseUrl}/api`;

  return {
    searchBooks: (query: SearchQuery) => {
      const params = new URLSearchParams({ q: query.q, limit: String(query.limit) });
      if (query.lang) {
        params.set("lang", query.lang);
      }
      return request<Book[]>(`${api}/search?${params.toString()}`, apiToken);
    },
    listLibrary: (query: LibraryListQuery) => {
      const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset) });
      if (query.status) {
        params.set("status", query.status);
      }
      if (query.query) {
        params.set("query", query.query);
      }
      return request<LibraryItem[]>(`${api}/library?${params.toString()}`, apiToken);
    },
    createLibraryItem: (payload: CreateLibraryItemInput) => {
      return request<LibraryItem>(`${api}/library`, apiToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateLibraryItem: (id: number, payload: UpdateLibraryItemInput) => {
      return request<LibraryItem>(`${api}/library/${id}`, apiToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deleteLibraryItem: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/library/${id}`, apiToken, {
        method: "DELETE",
      });
    },
    listReadingLists: () => request<ReadingListSummary[]>(`${api}/lists`, apiToken),
    createReadingList: (payload: CreateReadingListInput) => {
      return request<ReadingList>(`${api}/lists`, apiToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    getReadingList: (id: number) => request<ReadingListDetails>(`${api}/lists/${id}`, apiToken),
    updateReadingList: (id: number, payload: UpdateReadingListInput) => {
      return request<ReadingList>(`${api}/lists/${id}`, apiToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    deleteReadingList: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/lists/${id}`, apiToken, {
        method: "DELETE",
      });
    },
    addReadingListItem: (listId: number, payload: AddReadingListItemInput) => {
      return request<ReadingListDetails>(`${api}/lists/${listId}/items`, apiToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    removeReadingListItem: (listId: number, libraryItemId: number) => {
      return request<{ ok: boolean; listId: number; libraryItemId: number }>(
        `${api}/lists/${listId}/items/${libraryItemId}`,
        apiToken,
        {
          method: "DELETE",
        },
      );
    },
    getPreferences: () => request<Preferences>(`${api}/preferences`, apiToken),
    updatePreferences: (payload: UpdatePreferencesInput) => {
      return request<Preferences>(`${api}/preferences`, apiToken, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    listRecentSearches: () => request<RecentSearch[]>(`${api}/recent-searches`, apiToken),
    createRecentSearch: (payload: CreateRecentSearchInput) => {
      return request<RecentSearch>(`${api}/recent-searches`, apiToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    deleteRecentSearch: (id: number) => {
      return request<{ ok: boolean; id: number }>(`${api}/recent-searches/${id}`, apiToken, {
        method: "DELETE",
      });
    },
    clearRecentSearches: () => {
      return request<{ ok: boolean }>(`${api}/recent-searches`, apiToken, {
        method: "DELETE",
      });
    },
    getStats: () => request<Stats>(`${api}/stats`, apiToken),
  };
};
