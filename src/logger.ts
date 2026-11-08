import pino from "pino";

const isTest = process.env.NODE_ENV === "test";

const logger = pino({
  level: process.env.LOG_LEVEL ?? (isTest ? "silent" : "info"),
  ...(isTest
    ? {}
    : {
        transport: {
          target: "pino-pretty",
        },
      }),
});

export default logger;
