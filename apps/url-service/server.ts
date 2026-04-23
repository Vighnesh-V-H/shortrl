import app from "./app";
import { logger } from "@shared/logger";

const PORT = Number(process.env.PORT) || 8081;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `URL service listening on port ${PORT}`);
});
