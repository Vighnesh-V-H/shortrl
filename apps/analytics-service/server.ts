import app from "./app";
import { logger } from "@shared/logger";

const PORT = Number(process.env.PORT) || 8083;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Analytics service listening on port ${PORT}`);
});
