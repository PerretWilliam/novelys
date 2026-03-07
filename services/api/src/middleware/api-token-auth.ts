import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env";

const parseBearerToken = (authorization: string | undefined): string | null => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
};

const safeTokenEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const apiTokenAuth: RequestHandler = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  if (!env.API_TOKEN) {
    next();
    return;
  }

  const requestToken = parseBearerToken(req.header("authorization"));
  if (!requestToken || !safeTokenEqual(requestToken, env.API_TOKEN)) {
    res.status(401).json({ message: "Acces non autorise" });
    return;
  }

  next();
};
