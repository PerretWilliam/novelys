import { createRecentSearchInputSchema } from "@readingos/shared";
import type { RequestHandler } from "express";
import { z } from "zod";
import {
  clearRecentSearches,
  createOrTouchRecentSearch,
  deleteRecentSearch,
  listRecentSearches,
} from "./recent-searches.repository";

const idSchema = z.coerce.number().int().positive();

export const listRecentSearchesController: RequestHandler = async (_req, res) => {
  const searches = await listRecentSearches();
  res.json(searches);
};

export const createRecentSearchController: RequestHandler = async (req, res) => {
  const body = createRecentSearchInputSchema.parse(req.body);
  const recentSearch = await createOrTouchRecentSearch(body);
  res.status(201).json(recentSearch);
};

export const deleteRecentSearchController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const result = await deleteRecentSearch(id);
  res.json(result);
};

export const clearRecentSearchesController: RequestHandler = async (_req, res) => {
  const result = await clearRecentSearches();
  res.json(result);
};
