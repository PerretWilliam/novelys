import type { RequestHandler } from "express";
import { getLibraryStats } from "./stats.service";

export const getLibraryStatsController: RequestHandler = async (_req, res) => {
  const stats = await getLibraryStats();
  res.json(stats);
};
