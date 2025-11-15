import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { errorResponse } from "../utils/http";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  }, "Request error");
  
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json(
      errorResponse("VALIDATION_ERROR", "Invalid request data", {
        issues: err.issues,
      })
    );
  }
  
  // Known application errors
  if (err.status) {
    return res.status(err.status).json(
      errorResponse(err.code || "ERROR", err.message)
    );
  }
  
  // Default 500 error
  const isDev = process.env.NODE_ENV === "development";
  return res.status(500).json(
    errorResponse(
      "INTERNAL_ERROR",
      "An internal server error occurred",
      isDev ? { stack: err.stack } : undefined
    )
  );
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(
    errorResponse("NOT_FOUND", `Route ${req.method} ${req.path} not found`)
  );
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
