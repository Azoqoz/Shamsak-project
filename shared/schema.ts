import { pgTable, text, serial, integer, boolean, timestamp, json, date, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'technician', 'admin']);
export const serviceTypeEnum = pgEnum('service_type', ['installation', 'maintenance', 'assessment', 'consultation']);
export const serviceStatusEnum = pgEnum('service_status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'paid']);
export const propertyTypeEnum = pgEnum('property_type', ['residential', 'commercial', 'industrial', 'government']);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  technician: one(technicians, {
    fields: [users.id],
    references: [technicians.userId],
  }),
  serviceRequests: many(serviceRequests),
  reviews: many(reviews),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Technician schema
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  specialty: text("specialty").notNull(),
  experience: text("experience").notNull(),
  certifications: text("certifications").notNull(),
  bio: text("bio").notNull(),
  available: boolean("available").notNull().default(true),
  rating: integer("rating"),
  reviewCount: integer("review_count").default(0),
  // Geolocation data
  latitude: text("latitude"),
  longitude: text("longitude"),
  serviceRadius: integer("service_radius").default(25), // Service radius in kilometers
  // Service pricing in SAR
  installationPrice: integer("installation_price").notNull().default(500),
  maintenancePrice: integer("maintenance_price").notNull().default(300),
  assessmentPrice: integer("assessment_price").notNull().default(200),
  portfolioItems: text("portfolio_items").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  user: one(users, {
    fields: [technicians.userId],
    references: [users.id],
  }),
  serviceRequests: many(serviceRequests),
  reviews: many(reviews),
}));

export const insertTechnicianSchema = createInsertSchema(technicians).omit({
  id: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

// Service Request schema
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  technicianId: integer("technician_id").references(() => technicians.id),
  serviceType: serviceTypeEnum("service_type").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Geolocation data
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  // Status management
  status: serviceStatusEnum("status").notNull().default('pending'),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  // Payment information
  price: integer("price"), // Price in SAR
  isPaid: boolean("is_paid").default(false),
  paymentIntentId: text("payment_intent_id"), // For Stripe integration
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  user: one(users, {
    fields: [serviceRequests.userId],
    references: [users.id],
  }),
  technician: one(technicians, {
    fields: [serviceRequests.technicianId],
    references: [technicians.id],
  }),
}));

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  status: true,
  isPaid: true,
  paymentIntentId: true,
  price: true,
  completedDate: true,
  createdAt: true,
  updatedAt: true,
});

// Contact form schema
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  responded: boolean("responded").default(false),
  responseMessage: text("response_message"),
  respondedBy: integer("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  respondedByUser: one(users, {
    fields: [contacts.respondedBy],
    references: [users.id],
  }),
}));

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  userId: true,
  responded: true,
  responseMessage: true,
  respondedBy: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  userId: integer("user_id").references(() => users.id),
  serviceRequestId: integer("service_request_id").references(() => serviceRequests.id),
  userName: text("user_name").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  technician: one(technicians, {
    fields: [reviews.technicianId],
    references: [technicians.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  serviceRequest: one(serviceRequests, {
    fields: [reviews.serviceRequestId],
    references: [serviceRequests.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // system, service_update, payment, etc.
  read: boolean("read").notNull().default(false),
  relatedEntityType: text("related_entity_type"), // serviceRequest, review, payment, etc.
  relatedEntityId: integer("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in SAR
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [payments.serviceRequestId],
    references: [serviceRequests.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  paidAt: true,
  createdAt: true,
});

// Availability schedule for technicians
export const technicianAvailability = pgTable("technician_availability", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  startTime: text("start_time").notNull(), // Format: "09:00"
  endTime: text("end_time").notNull(), // Format: "17:00"
  isAvailable: boolean("is_available").notNull().default(true),
});

export const technicianAvailabilityRelations = relations(technicianAvailability, ({ one }) => ({
  technician: one(technicians, {
    fields: [technicianAvailability.technicianId],
    references: [technicians.id],
  }),
}));

export const insertTechnicianAvailabilitySchema = createInsertSchema(technicianAvailability).omit({
  id: true,
});

// Service types/categories provided
export const serviceTypes = pgTable("service_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon"),
  basePrice: integer("base_price").notNull(), // Base price in SAR
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
  createdAt: true,
});

// Media gallery for technician portfolio
export const mediaGallery = pgTable("media_gallery", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull().references(() => technicians.id),
  title: text("title").notNull(),
  description: text("description"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(), // image, video, document
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mediaGalleryRelations = relations(mediaGallery, ({ one }) => ({
  technician: one(technicians, {
    fields: [mediaGallery.technicianId],
    references: [technicians.id],
  }),
}));

export const insertMediaGallerySchema = createInsertSchema(mediaGallery).omit({
  id: true,
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

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type TechnicianAvailability = typeof technicianAvailability.$inferSelect;
export type InsertTechnicianAvailability = z.infer<typeof insertTechnicianAvailabilitySchema>;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;

export type MediaGallery = typeof mediaGallery.$inferSelect;
export type InsertMediaGallery = z.infer<typeof insertMediaGallerySchema>;
