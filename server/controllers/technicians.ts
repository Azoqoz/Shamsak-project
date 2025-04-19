import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { insertTechnicianSchema } from '@shared/schema';

export function registerTechnicianRoutes(app: Express, prefix: string, storage: IStorage) {
  // Get all technicians
  app.get(`${prefix}/technicians`, async (req: Request, res: Response) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error('Error getting technicians:', error);
      res.status(500).json({ message: 'Error retrieving technicians' });
    }
  });

  // Get featured technicians
  app.get(`${prefix}/technicians/featured`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const technicians = await storage.getFeaturedTechnicians(limit);
      res.json(technicians);
    } catch (error) {
      console.error('Error getting featured technicians:', error);
      res.status(500).json({ message: 'Error retrieving featured technicians' });
    }
  });

  // Get all technicians (admin view)
  app.get(`${prefix}/technicians/admin`, async (req: Request, res: Response) => {
    try {
      const technicians = await storage.getTechnicians();
      res.json(technicians);
    } catch (error) {
      console.error('Error getting technicians for admin:', error);
      res.status(500).json({ message: 'Error retrieving technicians' });
    }
  });
  
  // Get technician by user ID
  app.get(`${prefix}/technicians/user/:userId`, async (req: Request, res: Response) => {
    try {
      // Get and validate user ID
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      // Check if the user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the user is a technician
      if (user.role !== 'technician') {
        return res.status(403).json({ message: 'User is not a technician' });
      }

      // First, check if the technician exists for the user
      const technician = await storage.getTechnicianByUserId(userId);
      if (!technician) {
        console.warn(`No technician profile found for user ${userId} despite having technician role`);
        return res.status(404).json({ message: 'No technician profile found for this user' });
      }
      
      // Get the full technician profile with user data
      const technicianWithUser = await storage.getTechnician(technician.id);
      if (!technicianWithUser) {
        console.error(`Inconsistency: Technician record exists but getTechnician(${technician.id}) returned nothing`);
        return res.status(404).json({ message: 'Technician profile incomplete' });
      }

      // Return the complete technician profile
      res.json(technicianWithUser);
    } catch (error) {
      console.error('Error getting technician by user ID:', error);
      res.status(500).json({ 
        message: 'Error retrieving technician data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get a single technician by ID
  app.get(`${prefix}/technicians/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }

      const technician = await storage.getTechnician(id);
      if (!technician) {
        return res.status(404).json({ message: 'Technician not found' });
      }

      res.json(technician);
    } catch (error) {
      console.error('Error getting technician:', error);
      res.status(500).json({ message: 'Error retrieving technician' });
    }
  });

  // Create a new technician
  app.post(`${prefix}/technicians`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validationResult = insertTechnicianSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
      }

      // Check if user exists
      const user = await storage.getUser(validationResult.data.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has a technician profile
      const existingTechnician = await storage.getTechnicianByUserId(user.id);
      if (existingTechnician) {
        return res.status(409).json({ message: 'User already has a technician profile' });
      }

      const newTechnician = await storage.createTechnician(validationResult.data);
      
      // Get full technician with user data for response
      const techWithUser = await storage.getTechnician(newTechnician.id);
      res.status(201).json(techWithUser);
    } catch (error) {
      console.error('Error creating technician:', error);
      res.status(500).json({ message: 'Error creating technician' });
    }
  });

  // Update technician availability
  app.patch(`${prefix}/technicians/:id/availability`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }

      // Validate availability
      const availabilitySchema = z.object({
        available: z.boolean(),
      });

      const validationResult = availabilitySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid availability value', 
          errors: validationResult.error.errors 
        });
      }

      const { available } = validationResult.data;
      const updatedTechnician = await storage.updateTechnician(id, { available });
      
      if (!updatedTechnician) {
        return res.status(404).json({ message: 'Technician not found' });
      }

      // Get full technician with user data for response
      const techWithUser = await storage.getTechnician(id);
      res.json(techWithUser);
    } catch (error) {
      console.error('Error updating technician availability:', error);
      res.status(500).json({ message: 'Error updating technician availability' });
    }
  });

  // Update technician profile
  app.patch(`${prefix}/technicians/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }

      // Get existing technician
      const existingTechnician = await storage.getTechnician(id);
      if (!existingTechnician) {
        return res.status(404).json({ message: 'Technician not found' });
      }

      // Validate update fields
      const updateSchema = z.object({
        specialty: z.string().optional(),
        experience: z.string().optional(),
        certifications: z.string().optional(),
        bio: z.string().optional(),
        available: z.boolean().optional(),
        profileImage: z.string().nullable().optional(),
      });

      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid update data', 
          errors: validationResult.error.errors 
        });
      }

      const updatedTechnician = await storage.updateTechnician(id, validationResult.data);
      
      // Get full technician with user data for response
      const techWithUser = await storage.getTechnician(id);
      res.json(techWithUser);
    } catch (error) {
      console.error('Error updating technician:', error);
      res.status(500).json({ message: 'Error updating technician' });
    }
  });

  // Rate a technician
  app.post(`${prefix}/technicians/:id/rate`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }

      // Validate rating
      const ratingSchema = z.object({
        rating: z.number().min(1).max(5),
      });

      const validationResult = ratingSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid rating value', 
          errors: validationResult.error.errors 
        });
      }

      const { rating } = validationResult.data;
      const updatedTechnician = await storage.updateTechnicianRating(id, rating);
      
      if (!updatedTechnician) {
        return res.status(404).json({ message: 'Technician not found' });
      }

      // Get full technician with user data for response
      const techWithUser = await storage.getTechnician(id);
      res.json(techWithUser);
    } catch (error) {
      console.error('Error rating technician:', error);
      res.status(500).json({ message: 'Error rating technician' });
    }
  });
}
