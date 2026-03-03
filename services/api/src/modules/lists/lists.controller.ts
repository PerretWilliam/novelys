import {
  addReadingListItemInputSchema,
  createReadingListInputSchema,
  updateReadingListInputSchema,
} from "@readingos/shared";
import type { RequestHandler } from "express";
import { z } from "zod";
import {
  addItemToReadingList,
  createReadingList,
  deleteReadingList,
  getReadingListById,
  listReadingLists,
  removeItemFromReadingList,
  updateReadingList,
} from "./lists.repository";

const idSchema = z.coerce.number().int().positive();

export const listReadingListsController: RequestHandler = async (_req, res) => {
  const lists = await listReadingLists();
  res.json(lists);
};

export const createReadingListController: RequestHandler = async (req, res) => {
  const body = createReadingListInputSchema.parse(req.body);
  const list = await createReadingList(body);
  res.status(201).json(list);
};

export const getReadingListByIdController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const list = await getReadingListById(id);
  res.json(list);
};

export const updateReadingListController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const body = updateReadingListInputSchema.parse(req.body);
  const list = await updateReadingList(id, body);
  res.json(list);
};

export const deleteReadingListController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const result = await deleteReadingList(id);
  res.json(result);
};

export const addReadingListItemController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const body = addReadingListItemInputSchema.parse(req.body);
  const list = await addItemToReadingList(id, body);
  res.status(201).json(list);
};

export const removeReadingListItemController: RequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const libraryItemId = idSchema.parse(req.params.libraryItemId);
  const result = await removeItemFromReadingList(id, libraryItemId);
  res.json(result);
};
