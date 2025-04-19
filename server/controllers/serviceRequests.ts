import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { stripe } from '../routes';
import { insertServiceRequestSchema } from '@shared/schema';

// Add all service request statuses to the enum
const SERVICE_REQUEST_STATUSES = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'paid'] as const;

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

  // Create a new service request/booking
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

      // Get additional booking data that's not in the schema validation
      const { technicianId, price } = req.body;
      
      // Create booking data by combining validated data with booking info
      const bookingData = {
        ...validationResult.data,
        technicianId: technicianId ? parseInt(technicianId) : null,
        price: price ? parseInt(price) : null,
        isPaid: false // Initialize as unpaid
      };

      const newServiceRequest = await storage.createServiceRequest(bookingData);
      res.status(201).json(newServiceRequest);
    } catch (error) {
      console.error('Error creating service request/booking:', error);
      res.status(500).json({ message: 'Error creating service request/booking' });
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
        status: z.enum(SERVICE_REQUEST_STATUSES),
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

  // Update payment status
  app.patch(`${prefix}/service-requests/:id/payment`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service request ID' });
      }

      // Validate payment data
      const paymentSchema = z.object({
        isPaid: z.boolean(),
        paymentIntentId: z.string().optional(),
      });

      const validationResult = paymentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid payment data',
          errors: validationResult.error.errors
        });
      }

      const { isPaid, paymentIntentId } = validationResult.data;

      // Get the service request
      const serviceRequest = await storage.getServiceRequest(id);
      if (!serviceRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      // Update payment status and optional payment intent ID
      const updatedData = {
        ...serviceRequest,
        isPaid,
        paymentIntentId: paymentIntentId || serviceRequest.paymentIntentId,
        status: isPaid ? 'paid' : serviceRequest.status
      };

      // Use the existing status update method to update the status to 'paid'
      const updatedRequest = await storage.updateServiceRequestStatus(id, updatedData.status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Error updating payment status' });
    }
  });

  // Create a payment intent with Stripe
  app.post(`${prefix}/service-requests/:id/create-payment-intent`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid service request ID' });
      }

      // Get the service request
      const serviceRequest = await storage.getServiceRequest(id);
      if (!serviceRequest) {
        return res.status(404).json({ message: 'Service request not found' });
      }

      // Check if service request has a price
      if (!serviceRequest.price) {
        return res.status(400).json({ message: 'Service request does not have a price' });
      }

      // If there's already a payment intent ID and it's paid, return error
      if (serviceRequest.isPaid) {
        return res.status(400).json({ message: 'Service request is already paid' });
      }

      // Check if a payment intent already exists for this service request
      if (serviceRequest.paymentIntentId) {
        try {
          // Retrieve the existing payment intent
          const existingPaymentIntent = await stripe.paymentIntents.retrieve(
            serviceRequest.paymentIntentId
          );
          
          // If it exists and is not canceled, return its client secret
          if (existingPaymentIntent.status !== 'canceled') {
            return res.json({ 
              clientSecret: existingPaymentIntent.client_secret,
              paymentIntentId: existingPaymentIntent.id
            });
          }
        } catch (error) {
          // If the payment intent doesn't exist anymore, we'll create a new one
          console.log('Payment intent not found or error retrieving it:', error);
        }
      }
      
      // Create a new payment intent using Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(serviceRequest.price * 100), // convert to cents
        currency: 'sar', // Saudi Riyal
        metadata: {
          serviceRequestId: id.toString(),
          serviceType: serviceRequest.serviceType,
          technicianId: serviceRequest.technicianId ? serviceRequest.technicianId.toString() : 'none',
          customerName: serviceRequest.name,
          customerEmail: serviceRequest.email
        },
        receipt_email: serviceRequest.email,
        description: `Payment for ${serviceRequest.serviceType} service by Shamsak Solar`
      });
      
      // Get the client secret to be used on the frontend
      const clientSecret = paymentIntent.client_secret;
      
      // Update the service request with the payment intent ID
      await storage.updateServiceRequestPaymentIntent(id, paymentIntent.id);

      // Return the client secret
      res.json({ clientSecret });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: 'Error creating payment intent' });
    }
  });
}
