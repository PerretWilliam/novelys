import {
  createLibraryItemInputSchema,
  libraryListQuerySchema,
  updateLibraryItemInputSchema,
} from "@readingos/shared";
import type { RequestHandler } from "express";
import { z } from "zod";
import {
  createLibraryItem,
  deleteLibraryItem,
  getLibraryItemById,
  listLibraryItems,
  updateLibraryItem,
} from "./library.repository";

const idSchema = z.coerce.number().int().positive();

export const createLibraryItemController: RequestHandler = async (req, res) => {
  const body = createLibraryItemInputSchema.parse(req.body);
  const item = await createLibraryItem(body);
  res.status(201).json(item);
};

export const listLibraryItemsController: RequestHandler = async (req, res) => {
  const query = libraryListQuerySchema.parse(req.query);
  const items = await listLibraryItems(query);
  res.json(items);
};

export const getLibraryItemByIdController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const item = await getLibraryItemById(id);
  res.json(item);
};

export const updateLibraryItemController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const body = updateLibraryItemInputSchema.parse(req.body);
  const item = await updateLibraryItem(id, body);
  res.json(item);
};

export const deleteLibraryItemController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const result = await deleteLibraryItem(id);
  res.json(result);
};
