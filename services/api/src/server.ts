import { app } from "./app";
import { bootstrapDatabase } from "./db/bootstrap";
import { env } from "./config/env";

const startServer = async () => {
  await bootstrapDatabase();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
};

void startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API:", error);
  process.exit(1);
});
