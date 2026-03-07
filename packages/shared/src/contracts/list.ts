import { z } from "zod";
import { libraryItemSchema } from "./library";

export const readingListSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const readingListSummarySchema = readingListSchema.extend({
  itemCount: z.number().int().min(0),
  previewItems: z.array(libraryItemSchema),
});

export const readingListDetailsSchema = readingListSchema.extend({
  items: z.array(libraryItemSchema),
});

export const createReadingListInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
  color: z.string().trim().max(20).optional(),
});

export const updateReadingListInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(300).nullable().optional(),
    color: z.string().trim().max(20).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Au moins un champ doit etre fourni.",
  });

export const addReadingListItemInputSchema = z.object({
  libraryItemId: z.number().int().positive(),
});

export type ReadingList = z.infer<typeof readingListSchema>;
export type ReadingListSummary = z.infer<typeof readingListSummarySchema>;
export type ReadingListDetails = z.infer<typeof readingListDetailsSchema>;
export type CreateReadingListInput = z.infer<typeof createReadingListInputSchema>;
export type UpdateReadingListInput = z.infer<typeof updateReadingListInputSchema>;
export type AddReadingListItemInput = z.infer<typeof addReadingListItemInputSchema>;
