import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import helmet from "helmet";
import { loadConfig, getConfig, isTrustProxy } from "./config/env";
import { logger, createRequestLogger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import toolRoutes from "./routes/toolRoutes";

// Load and validate environment
loadConfig();

export async function registerRoutes(app: Express): Promise<Server> {
  const config = getConfig();
  
  // Trust proxy if configured (important for getting real IP behind load balancers)
  if (isTrustProxy()) {
    app.set("trust proxy", 1);
  }
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  }));
  
  // CORS configuration
  const allowedOrigins = config.ALLOWED_ORIGINS === "*" 
    ? "*" 
    : config.ALLOWED_ORIGINS.split(",");
    
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
  
  // Body parsing middleware is already added in server/index.ts
  
  // Request logging
  app.use(createRequestLogger());
  
  // API routes
  app.use("/api", toolRoutes);
  
  // Error handler (must be last)
  // Note: 404 handler removed - Vite middleware handles frontend routing
  app.use(errorHandler);

  const httpServer = createServer(app);

  return httpServer;
}
