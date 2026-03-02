import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { searchBooksController } from "./search.controller";

const router = Router();

router.get("/search", asyncHandler(searchBooksController));

export { router as booksRouter };
