import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from '../storage';
import { insertUserSchema } from '@shared/schema';

export function registerAuthRoutes(app: Express, prefix: string, storage: IStorage) {
  // Logout endpoint
  app.post(`${prefix}/auth/logout`, async (req: Request, res: Response) => {
    try {
      // Clear the session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Error during logout' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Error during logout' });
    }
  });
  // Get current user endpoint
  app.get(`${prefix}/auth/user`, async (req: Request, res: Response) => {
    try {
      // Check if there's a userId in the session (this would be set after login in a real app)
      // In a real application, we would use passport or a similar library to handle sessions
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ message: 'Error retrieving user data' });
    }
  });
  // Login endpoint
  app.post(`${prefix}/auth/login`, async (req: Request, res: Response) => {
    try {
      // Validate login credentials
      const loginSchema = z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
      });

      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid login data', 
          errors: validationResult.error.errors 
        });
      }

      const { username, password } = validationResult.data;

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // In a real app, we would use bcrypt.compare or similar
      // For this demo, we're doing a simple string comparison
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Store user ID in session
      req.session.userId = user.id;
      
      // Return user info (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  });

  // Register endpoint
  app.post(`${prefix}/auth/register`, async (req: Request, res: Response) => {
    try {
      // Extend the schema for registration with password confirmation
      const registrationSchema = insertUserSchema.extend({
        confirmPassword: z.string().min(1, 'Confirm password is required'),
      }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });

      const validationResult = registrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid registration data', 
          errors: validationResult.error.errors 
        });
      }

      // Remove confirmPassword from data
      const { confirmPassword, ...userData } = validationResult.data;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      // Create user
      const newUser = await storage.createUser(userData);
      
      // Store user ID in session
      req.session.userId = newUser.id;

      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Error during registration' });
    }
  });

  // Get user profile
  app.get(`${prefix}/auth/profile/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ message: 'Error retrieving user profile' });
    }
  });

  // Update user profile
  app.patch(`${prefix}/auth/profile/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get existing user
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate update fields
      const updateSchema = z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
      });

      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid update data', 
          errors: validationResult.error.errors 
        });
      }

      const updatedUser = await storage.updateUser(id, validationResult.data);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Error updating user profile' });
    }
  });

  // Change password
  app.post(`${prefix}/auth/change-password/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate password change
      const passwordSchema = z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });

      const validationResult = passwordSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid password data', 
          errors: validationResult.error.errors 
        });
      }

      const { currentPassword, newPassword } = validationResult.data;

      // Get user
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      // In a real app, we would use bcrypt.compare or similar
      if (user.password !== currentPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      const updatedUser = await storage.updateUser(id, { password: newPassword });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Error changing password' });
    }
  });
}
