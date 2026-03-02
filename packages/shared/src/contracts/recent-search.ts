import { z } from "zod";
import { searchLangSchema } from "./preferences";

export const recentSearchSchema = z.object({
  id: z.number().int().positive(),
  query: z.string().trim().min(1),
  lang: searchLangSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createRecentSearchInputSchema = z.object({
  query: z.string().trim().min(1).max(120),
  lang: searchLangSchema,
});

export type RecentSearch = z.infer<typeof recentSearchSchema>;
export type CreateRecentSearchInput = z.infer<typeof createRecentSearchInputSchema>;
