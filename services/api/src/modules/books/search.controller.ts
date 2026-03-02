import { searchQuerySchema } from "@readingos/shared";
import type { RequestHandler } from "express";
import { searchBooks } from "./search.service";

export const searchBooksController: RequestHandler = async (req, res) => {
  const query = searchQuerySchema.parse(req.query);
  const books = await searchBooks(query);
  res.json(books);
};
