import pino from "pino";
import { getConfig } from "./env";

export const logger = pino({
  level: getConfig().NODE_ENV === "production" ? "info" : "debug",
  transport: getConfig().NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
  } : undefined,
  redact: {
    paths: ["req.headers.authorization", "*.password", "*.secret"],
    remove: true,
  },
});

export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    req.log = logger.child({ reqId: crypto.randomUUID() });
    const start = Date.now();
    
    res.on("finish", () => {
      req.log.info({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: Date.now() - start,
      }, "Request completed");
    });
    
    next();
  };
}
