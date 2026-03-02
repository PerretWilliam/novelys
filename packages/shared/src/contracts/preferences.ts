import { z } from "zod";

export const searchLangSchema = z.enum(["fr", "en"]);
export const themeModeSchema = z.enum(["system", "light", "dark"]);

export const preferencesSchema = z.object({
  searchLang: searchLangSchema,
  themeMode: themeModeSchema,
  showCovers: z.boolean(),
  compactMode: z.boolean(),
  updatedAt: z.string(),
});

export const updatePreferencesInputSchema = z
  .object({
    searchLang: searchLangSchema.optional(),
    themeMode: themeModeSchema.optional(),
    showCovers: z.boolean().optional(),
    compactMode: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type SearchLang = z.infer<typeof searchLangSchema>;
export type ThemeMode = z.infer<typeof themeModeSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInputSchema>;
