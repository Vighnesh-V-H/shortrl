import pino from "pino";
import pretty from "pino-pretty";

const logLevel = (process.env.LOG_LEVEL || "info") as pino.LevelWithSilent;

const logger = pino(
  {
    level: logLevel,
  },
  pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: false,
    },
  })
);

export default logger;
