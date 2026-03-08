import type { Book } from "@readingos/shared";

type GoogleIdentifier = {
  type?: string;
  identifier?: string;
};

type GoogleVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    previewLink?: string;
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: GoogleIdentifier[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
};

const extractIsbn = (
  identifiers: GoogleIdentifier[] | undefined,
  type: "ISBN_13" | "ISBN_10",
): string | undefined => {
  return identifiers?.find((identifier) => identifier.type === type)?.identifier;
};

const normalizeThumbnail = (thumbnail?: string): string | undefined => {
  if (!thumbnail) {
    return undefined;
  }
  return thumbnail.replace("http://", "https://");
};

export const normalizeGoogleBook = (input: unknown): Book | null => {
  const volume = input as GoogleVolume;

  if (!volume.id || !volume.volumeInfo?.title) {
    return null;
  }

  const identifiers = volume.volumeInfo.industryIdentifiers;
  return {
    source: "google",
    sourceId: volume.id,
    title: volume.volumeInfo.title,
    authors: volume.volumeInfo.authors ?? [],
    publisher: volume.volumeInfo.publisher,
    publishedDate: volume.volumeInfo.publishedDate,
    description: volume.volumeInfo.description,
    isbn13: extractIsbn(identifiers, "ISBN_13"),
    isbn10: extractIsbn(identifiers, "ISBN_10"),
    pageCount: volume.volumeInfo.pageCount && volume.volumeInfo.pageCount > 0 ? volume.volumeInfo.pageCount : undefined,
    categories: volume.volumeInfo.categories,
    language: volume.volumeInfo.language,
    thumbnail: normalizeThumbnail(volume.volumeInfo.imageLinks?.thumbnail),
    previewLink: volume.volumeInfo.previewLink,
    averageRating:
      typeof volume.volumeInfo.averageRating === "number" &&
      volume.volumeInfo.averageRating >= 0 &&
      volume.volumeInfo.averageRating <= 5
        ? volume.volumeInfo.averageRating
        : undefined,
    ratingsCount:
      typeof volume.volumeInfo.ratingsCount === "number" && volume.volumeInfo.ratingsCount >= 0
        ? Math.floor(volume.volumeInfo.ratingsCount)
        : undefined,
  };
};

export const rankBooks = (books: Book[]): Book[] => {
  return [...books].sort((a, b) => {
    const scoreA =
      Number(Boolean(a.averageRating)) * 3 +
      Math.min(3, Math.floor((a.ratingsCount ?? 0) / 100)) +
      Number(Boolean(a.isbn13)) +
      Number(Boolean(a.thumbnail)) +
      Number(Boolean(a.pageCount));
    const scoreB =
      Number(Boolean(b.averageRating)) * 3 +
      Math.min(3, Math.floor((b.ratingsCount ?? 0) / 100)) +
      Number(Boolean(b.isbn13)) +
      Number(Boolean(b.thumbnail)) +
      Number(Boolean(b.pageCount));
    return scoreB - scoreA;
  });
};
