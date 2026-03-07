import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Erreur de validation",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const message = error instanceof Error ? error.message : "Erreur inattendue";

  if (!isProduction && error instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(500).json({ message: isProduction ? "Erreur interne du serveur" : message });
};
