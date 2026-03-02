import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1),
  lang: z.enum(["fr", "en"]).optional(),
  limit: z.coerce.number().int().min(1).max(40).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
