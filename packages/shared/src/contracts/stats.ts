import { z } from "zod";

export const statsSchema = z.object({
  totalItems: z.number().int().min(0),
  totalRead: z.number().int().min(0),
  totalReading: z.number().int().min(0),
  averageRating: z.number().min(0),
  pagesRead: z.number().int().min(0),
});

export type Stats = z.infer<typeof statsSchema>;
