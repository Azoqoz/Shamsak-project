import { Request, Response } from "express";
import type { Express } from "express";
import { IStorage } from "../storage";
import { insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function registerReviewRoutes(app: Express, prefix: string, storage: IStorage) {
  // Get all reviews for a technician
  app.get(`${prefix}/reviews/technician/:technicianId`, async (req: Request, res: Response) => {
    try {
      const technicianId = parseInt(req.params.technicianId);
      if (isNaN(technicianId)) {
        return res.status(400).json({ error: "Invalid technician ID" });
      }

      const reviews = await storage.getReviewsByTechnician(technicianId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Get a specific review
  app.get(`${prefix}/reviews/:id`, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ error: "Invalid review ID" });
      }

      const review = await storage.getReview(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ error: "Failed to fetch review" });
    }
  });

  // Create a new review
  app.post(`${prefix}/reviews`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Check if technician exists
      const technician = await storage.getTechnician(validatedData.technicianId);
      if (!technician) {
        return res.status(404).json({ error: "Technician not found" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: fromZodError(error).message });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });
}