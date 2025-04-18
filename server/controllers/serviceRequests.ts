import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { insertServiceRequestSchema } from '@shared/schema';

export function registerServiceRequestRoutes(app: Express, prefix: string, storage: IStorage) {
  // Get all service requests (admin)
  app.get(`${prefix}/service-requests/admin`, async (req: Request, res: Response) => {
    try {
      const serviceRequests = await storage.getServiceRequests();
      res.json(serviceRequests);
    } catch (error) {
      console.error('Error getting service requests:', error);
      res.status(500).json({ message: 'Error retrieving service requests' });
    }
  });

  // Get service requests for a specific technician
  app.get(`${prefix}/service-requests/technician/:technicianId`, async (req: Request, res: Response) => {
    try {
      const technicianId = parseInt(req.params.technicianId);
      if (isNaN(technicianId)) {
        return res.status(400).json({ message: 'Invalid technician ID' });
      }

      const serviceRequests = await storage.getServiceRequestsByTechnician(technicianId);
      res.json(serviceRequests);
    } catch (error) {
      console.error('Error getting technician service requests:', error);
      res.status(500).json({ message: 'Error retrieving service requests' });
    }
  });

  // Get service requests for the logged-in user
  app.get(`${prefix}/service-requests/user/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const serviceRequests = await storage.getUserServiceRequests(userId);
      res.json(serviceRequests);
    } catch (error) {
      console.error('Error getting user service requests:', error);
      res.status(500).json({ message: 'Error retrieving service requests' });
    }
  });

  // Get a single service request by ID
  app.get(`${prefix}/service-requests/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service request ID' });
      }

      const serviceRequest = await storage.getServiceRequest(id);
      if (!serviceRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      res.json(serviceRequest);
    } catch (error) {
      console.error('Error getting service request:', error);
      res.status(500).json({ message: 'Error retrieving service request' });
    }
  });

  // Create a new service request
  app.post(`${prefix}/service-requests`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validationResult = insertServiceRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
      }

      const newServiceRequest = await storage.createServiceRequest(validationResult.data);
      res.status(201).json(newServiceRequest);
    } catch (error) {
      console.error('Error creating service request:', error);
      res.status(500).json({ message: 'Error creating service request' });
    }
  });

  // Update service request status
  app.patch(`${prefix}/service-requests/:id/status`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service request ID' });
      }

      // Validate status
      const statusSchema = z.object({
        status: z.enum(['pending', 'assigned', 'completed', 'cancelled']),
      });

      const validationResult = statusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid status', 
          errors: validationResult.error.errors 
        });
      }

      const { status } = validationResult.data;
      const updatedRequest = await storage.updateServiceRequestStatus(id, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating service request status:', error);
      res.status(500).json({ message: 'Error updating service request status' });
    }
  });

  // Assign technician to service request
  app.patch(`${prefix}/service-requests/:id/assign`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service request ID' });
      }

      // Validate technician ID
      const technicianSchema = z.object({
        technicianId: z.number().int().positive(),
      });

      const validationResult = technicianSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid technician ID', 
          errors: validationResult.error.errors 
        });
      }

      const { technicianId } = validationResult.data;
      
      // Verify technician exists
      const technician = await storage.getTechnician(technicianId);
      if (!technician) {
        return res.status(404).json({ message: 'Technician not found' });
      }

      const updatedRequest = await storage.assignTechnicianToServiceRequest(id, technicianId);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error('Error assigning technician:', error);
      res.status(500).json({ message: 'Error assigning technician to service request' });
    }
  });
}
