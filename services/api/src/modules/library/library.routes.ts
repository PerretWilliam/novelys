import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import {
  createLibraryItemController,
  deleteLibraryItemController,
  getLibraryItemByIdController,
  listLibraryItemsController,
  updateLibraryItemController,
} from "./library.controller";

const router = Router();

router.post("/library", asyncHandler(createLibraryItemController));

router.get("/library", asyncHandler(listLibraryItemsController));

router.get("/library/:id", asyncHandler(getLibraryItemByIdController));

router.patch("/library/:id", asyncHandler(updateLibraryItemController));

router.delete("/library/:id", asyncHandler(deleteLibraryItemController));

export { router as libraryRouter };
