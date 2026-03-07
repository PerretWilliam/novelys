import { z } from "zod";

export const searchLangSchema = z.enum(["fr", "en"]);
export const themeModeSchema = z.enum(["system", "light", "dark"]);

export const preferencesSchema = z.object({
  searchLang: searchLangSchema,
  themeMode: themeModeSchema,
  updatedAt: z.string(),
});

export const updatePreferencesInputSchema = z
  .object({
    searchLang: searchLangSchema.optional(),
    themeMode: themeModeSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Au moins un champ doit etre fourni.",
  });

export type SearchLang = z.infer<typeof searchLangSchema>;
export type ThemeMode = z.infer<typeof themeModeSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesInputSchema>;
