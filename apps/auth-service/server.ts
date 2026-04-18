import app from "./app";
import { logger } from "@shared/logger";

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Auth service listening on port ${PORT}`);
});
