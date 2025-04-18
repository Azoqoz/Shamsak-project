import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, admin, technician
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Technician schema
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  experience: text("experience").notNull(),
  certifications: text("certifications").notNull(),
  bio: text("bio").notNull(),
  available: boolean("available").notNull().default(true),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  profileImage: text("profile_image"),
  // Geolocation data
  latitude: text("latitude"),
  longitude: text("longitude"),
  serviceRadius: integer("service_radius").default(25), // Service radius in kilometers
  // Service pricing in SAR
  installationPrice: integer("installation_price").notNull().default(500),
  maintenancePrice: integer("maintenance_price").notNull().default(300),
  assessmentPrice: integer("assessment_price").notNull().default(200),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  reviewCount: true,
  createdAt: true,
});

// Service Request schema (now Booking)
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  propertyType: text("property_type").notNull(),
  additionalDetails: text("additional_details"),
  // Geolocation data
  latitude: text("latitude"),
  longitude: text("longitude"),
  status: text("status").notNull().default("pending"), // pending, assigned, completed, cancelled, paid
  technicianId: integer("technician_id").references(() => technicians.id),
  price: integer("price"), // Price in SAR
  isPaid: boolean("is_paid").default(false),
  paymentIntentId: text("payment_intent_id"), // For Stripe integration
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  status: true,
  isPaid: true,
  paymentIntentId: true,
  price: true,
  createdAt: true,
});

// Contact form schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  responded: boolean("responded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  responded: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
