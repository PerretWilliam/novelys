import { z } from "zod";

export const bookSchema = z.object({
  source: z.literal("google"),
  sourceId: z.string().min(1),
  title: z.string().min(1),
  authors: z.array(z.string()),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  isbn13: z.string().optional(),
  isbn10: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
  categories: z.array(z.string()).optional(),
  language: z.string().optional(),
  thumbnail: z.string().url().optional(),
  previewLink: z.string().url().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  ratingsCount: z.number().int().min(0).optional(),
});

export type Book = z.infer<typeof bookSchema>;
