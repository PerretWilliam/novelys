import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import {
  addReadingListItemController,
  createReadingListController,
  deleteReadingListController,
  getReadingListByIdController,
  listReadingListsController,
  removeReadingListItemController,
  updateReadingListController,
} from "./lists.controller";

const router = Router();

router.get("/lists", asyncHandler(listReadingListsController));

router.post("/lists", asyncHandler(createReadingListController));

router.get("/lists/:id", asyncHandler(getReadingListByIdController));

router.patch("/lists/:id", asyncHandler(updateReadingListController));

router.delete("/lists/:id", asyncHandler(deleteReadingListController));

router.post("/lists/:id/items", asyncHandler(addReadingListItemController));

router.delete("/lists/:id/items/:libraryItemId", asyncHandler(removeReadingListItemController));

export { router as listsRouter };
