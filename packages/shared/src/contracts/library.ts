import { z } from "zod";
import { bookSchema } from "./book";

export const libraryStatusSchema = z.enum(["to_read", "reading", "read", "abandoned"]);
const ratingSchema = z
  .number()
  .min(0.5)
  .max(5)
  .refine((value) => Number.isInteger(value * 2), {
    message: "La note doit aller de 0,5 a 5 avec un pas de 0,5.",
  });

export const libraryItemSchema = z.object({
  id: z.number().int().positive(),
  status: libraryStatusSchema,
  rating: ratingSchema.optional(),
  review: z.string().optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  book: bookSchema,
});

export const createLibraryItemInputSchema = z.object({
  book: bookSchema,
  status: libraryStatusSchema,
  rating: ratingSchema.optional(),
  review: z.string().max(5000).optional(),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
});

export const updateLibraryItemInputSchema = z
  .object({
    status: libraryStatusSchema.optional(),
    rating: ratingSchema.nullable().optional(),
    review: z.string().max(5000).nullable().optional(),
    startedAt: z.string().nullable().optional(),
    finishedAt: z.string().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Au moins un champ doit etre fourni.",
  });

export const libraryListQuerySchema = z.object({
  status: libraryStatusSchema.optional(),
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type LibraryStatus = z.infer<typeof libraryStatusSchema>;
export type LibraryItem = z.infer<typeof libraryItemSchema>;
export type CreateLibraryItemInput = z.infer<typeof createLibraryItemInputSchema>;
export type UpdateLibraryItemInput = z.infer<typeof updateLibraryItemInputSchema>;
export type LibraryListQuery = z.infer<typeof libraryListQuerySchema>;
