import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { registerServiceRequestRoutes } from "./controllers/serviceRequests";
import { registerTechnicianRoutes } from "./controllers/technicians";
import { registerContactRoutes } from "./controllers/contacts";
import { registerAuthRoutes } from "./controllers/auth";

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe payments will not work properly.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

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
