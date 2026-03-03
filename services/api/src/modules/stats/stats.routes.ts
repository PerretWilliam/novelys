import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { getLibraryStatsController } from "./stats.controller";

const router = Router();

router.get("/stats", asyncHandler(getLibraryStatsController));

export { router as statsRouter };
