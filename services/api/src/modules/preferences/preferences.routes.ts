import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { getPreferencesController, updatePreferencesController } from "./preferences.controller";

const router = Router();

router.get("/preferences", asyncHandler(getPreferencesController));

router.patch("/preferences", asyncHandler(updatePreferencesController));

export { router as preferencesRouter };
