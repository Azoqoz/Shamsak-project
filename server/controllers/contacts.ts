import { Express, Request, Response } from 'express';
import { IStorage } from '../storage';
import { insertContactSchema } from '@shared/schema';

export function registerContactRoutes(app: Express, prefix: string, storage: IStorage) {
  // Get all contacts (admin)
  app.get(`${prefix}/contacts/admin`, async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ message: 'Error retrieving contacts' });
    }
  });

  // Get a single contact by ID
  app.get(`${prefix}/contacts/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.json(contact);
    } catch (error) {
      console.error('Error getting contact:', error);
      res.status(500).json({ message: 'Error retrieving contact' });
    }
  });

  // Create a new contact message
  app.post(`${prefix}/contacts`, async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validationResult = insertContactSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: validationResult.error.errors 
        });
      }

      const newContact = await storage.createContact(validationResult.data);
      res.status(201).json(newContact);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ message: 'Error creating contact' });
    }
  });

  // Mark contact as responded
  app.patch(`${prefix}/contacts/:id/respond`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }

      const updatedContact = await storage.markContactResponded(id, true);
      
      if (!updatedContact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.json(updatedContact);
    } catch (error) {
      console.error('Error marking contact as responded:', error);
      res.status(500).json({ message: 'Error updating contact' });
    }
  });
}
