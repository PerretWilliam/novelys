import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { booksRouter } from "./modules/books/search.routes";
import { libraryRouter } from "./modules/library/library.routes";
import { listsRouter } from "./modules/lists/lists.routes";
import { preferencesRouter } from "./modules/preferences/preferences.routes";
import { recentSearchesRouter } from "./modules/recent-searches/recent-searches.routes";
import { statsRouter } from "./modules/stats/stats.routes";

export const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", booksRouter);
app.use("/api", libraryRouter);
app.use("/api", listsRouter);
app.use("/api", preferencesRouter);
app.use("/api", recentSearchesRouter);
app.use("/api", statsRouter);

app.use(errorHandler);
