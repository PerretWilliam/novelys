import { updatePreferencesInputSchema } from "@readingos/shared";
import type { RequestHandler } from "express";
import { getPreferences, updatePreferences } from "./preferences.repository";

export const getPreferencesController: RequestHandler = async (_req, res) => {
  const preferences = await getPreferences();
  res.json(preferences);
};

export const updatePreferencesController: RequestHandler = async (req, res) => {
  const body = updatePreferencesInputSchema.parse(req.body);
  const preferences = await updatePreferences(body);
  res.json(preferences);
};
