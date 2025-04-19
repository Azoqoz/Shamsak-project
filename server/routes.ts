import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import Stripe from "stripe";
import { storage } from "./storage";
import { registerServiceRequestRoutes } from "./controllers/serviceRequests";
import { registerTechnicianRoutes } from "./controllers/technicians";
import { registerContactRoutes } from "./controllers/contacts";
import { registerAuthRoutes } from "./controllers/auth";
import { registerReviewRoutes } from "./controllers/reviews";

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe payments will not work properly.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware with improved configuration
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'shamsak-secret-key',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh cookie expiration on every response
    store: storage.sessionStore, // Use the database for session storage
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      path: '/'
    },
    name: 'shamsak.sid', // Custom name to avoid conflicts
  });
  
  // Debug middleware for session monitoring in development
  app.use((req, res, next) => {
    const oldEnd = res.end;
    res.end = function() {
      if (req.session && req.path.startsWith('/api/auth')) {
        console.log(`Session after ${req.method} ${req.path}:`, {
          id: req.sessionID, 
          userId: req.session.userId,
          cookie: req.session.cookie?.originalMaxAge
        });
      }
      return oldEnd.apply(this, arguments as any);
    };
    next();
  });
  
  app.use(sessionMiddleware);
  
  // API prefix for all routes
  const apiPrefix = '/api';

  // Register all route controllers
  registerServiceRequestRoutes(app, apiPrefix, storage);
  registerTechnicianRoutes(app, apiPrefix, storage);
  registerContactRoutes(app, apiPrefix, storage);
  registerAuthRoutes(app, apiPrefix, storage);
  registerReviewRoutes(app, apiPrefix, storage);

  // Health check route
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
