import { env } from "../../config/env";

type GoogleBooksResponse = {
  items?: unknown[];
};

export const searchGoogleBooks = async (params: {
  q: string;
  lang?: string;
  limit: number;
}): Promise<unknown[]> => {
  const query = new URLSearchParams({
    q: params.q,
    maxResults: String(params.limit),
    printType: "books",
  });

  if (params.lang) {
    query.set("langRestrict", params.lang);
  }

  if (env.GOOGLE_BOOKS_API_KEY) {
    query.set("key", env.GOOGLE_BOOKS_API_KEY);
  }

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`Google Books failed with status ${response.status}`);
  }

  const body = (await response.json()) as GoogleBooksResponse;
  return body.items ?? [];
};
