import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerServiceRequestRoutes } from "./controllers/serviceRequests";
import { registerTechnicianRoutes } from "./controllers/technicians";
import { registerContactRoutes } from "./controllers/contacts";
import { registerAuthRoutes } from "./controllers/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = '/api';

  // Register all route controllers
  registerServiceRequestRoutes(app, apiPrefix, storage);
  registerTechnicianRoutes(app, apiPrefix, storage);
  registerContactRoutes(app, apiPrefix, storage);
  registerAuthRoutes(app, apiPrefix, storage);

  // Health check route
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
