import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import {
  clearRecentSearchesController,
  createRecentSearchController,
  deleteRecentSearchController,
  listRecentSearchesController,
} from "./recent-searches.controller";

const router = Router();

router.get("/recent-searches", asyncHandler(listRecentSearchesController));

router.post("/recent-searches", asyncHandler(createRecentSearchController));

router.delete("/recent-searches/:id", asyncHandler(deleteRecentSearchController));

router.delete("/recent-searches", asyncHandler(clearRecentSearchesController));

export { router as recentSearchesRouter };
