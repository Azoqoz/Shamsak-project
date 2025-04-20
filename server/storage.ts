import { 
  User, 
  InsertUser, 
  Technician, 
  InsertTechnician, 
  ServiceRequest, 
  InsertServiceRequest, 
  Contact, 
  InsertContact,
  Review,
  InsertReview,
  Notification,
  InsertNotification,
  Payment,
  InsertPayment,
  TechnicianAvailability,
  InsertTechnicianAvailability,
  ServiceType,
  InsertServiceType,
  MediaGallery,
  InsertMediaGallery,
  users,
  technicians,
  serviceRequests,
  contacts,
  reviews,
  notifications,
  payments,
  technicianAvailability,
  serviceTypes,
  mediaGallery
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, isNull, not, or, like, lt, gt, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Interface for all storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;

  // Technician methods
  getTechnician(id: number): Promise<(Technician & { user: User }) | undefined>;
  getTechnicianByUserId(userId: number): Promise<Technician | undefined>;
  getTechnicians(): Promise<(Technician & { user: User })[]>;
  getFeaturedTechnicians(limit?: number): Promise<(Technician & { user: User })[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, technicianData: Partial<Technician>): Promise<Technician | undefined>;
  updateTechnicianRating(id: number, rating: number): Promise<Technician | undefined>;

  // Service Request methods
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestsByTechnician(technicianId: number): Promise<ServiceRequest[]>;
  getUserServiceRequests(userId: number): Promise<ServiceRequest[]>;
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;
  assignTechnicianToServiceRequest(id: number, technicianId: number): Promise<ServiceRequest | undefined>;
  updateServiceRequestPaymentIntent(id: number, paymentIntentId: string): Promise<ServiceRequest | undefined>;
  
  // Contact methods
  getContact(id: number): Promise<Contact | undefined>;
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  markContactResponded(id: number, responded: boolean): Promise<Contact | undefined>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByTechnician(technicianId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private technicians: Map<number, Technician>;
  private serviceRequests: Map<number, ServiceRequest>;
  private contacts: Map<number, Contact>;
  private reviews: Map<number, Review>;
  private currentIds: {
    user: number;
    technician: number;
    serviceRequest: number;
    contact: number;
    review: number;
  };

  constructor() {
    this.users = new Map();
    this.technicians = new Map();
    this.serviceRequests = new Map();
    this.contacts = new Map();
    this.reviews = new Map();
    this.currentIds = {
      user: 1,
      technician: 1,
      serviceRequest: 1,
      contact: 1,
      review: 1
    };

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create admin user
    const adminUser: User = {
      id: this.currentIds.user++,
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      role: "admin",
      name: "Admin User",
      email: "admin@shamsak.sa",
      phone: "+966123456789",
      city: "riyadh",
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Create some technician users
    const cities = ["riyadh", "jeddah", "dammam"];
    const technicianNames = [
      { name: "Mohammed Al-Harbi", city: cities[0] },
      { name: "Khaled Al-Ghamdi", city: cities[1] },
      { name: "Ahmed Al-Otaibi", city: cities[2] }
    ];

    technicianNames.forEach((tech, index) => {
      // Create user for technician
      const techUser: User = {
        id: this.currentIds.user++,
        username: `tech${index + 1}`,
        password: "tech123", // In a real app, this would be hashed
        role: "technician",
        name: tech.name,
        email: `tech${index + 1}@shamsak.sa`,
        phone: `+9661234567${index + 1}`,
        city: tech.city,
        createdAt: new Date()
      };
      this.users.set(techUser.id, techUser);

      // Create technician profile with pricing
      const technician: Technician = {
        id: this.currentIds.technician++,
        userId: techUser.id,
        specialty: index === 0 ? "Solar Panel Installation" : 
                  index === 1 ? "Energy Efficiency Assessment" : 
                  "Maintenance and Repair",
        experience: 5 + index,
        certifications: "Saudi Renewable Energy Certificate",
        bio: `Experienced solar technician specializing in ${
          index === 0 ? "residential solar panel installation" : 
          index === 1 ? "commercial solar systems and energy assessments" : 
          "maintenance and troubleshooting of solar systems"
        } with ${5 + index} years of experience.`,
        available: true,
        rating: 4 + (index === 1 ? 1 : 0) - (index === 2 ? 0.5 : 0),
        reviewCount: 20 + index * 10,
        profileImage: `/images/tech${index + 1}.svg`,
        // Geolocation data - Using approximate coordinates for Saudi cities
        latitude: index === 0 ? "24.7136" : // Riyadh
                  index === 1 ? "21.4858" : // Jeddah
                  "26.4367", // Dammam
        longitude: index === 0 ? "46.6753" : // Riyadh
                   index === 1 ? "39.1925" : // Jeddah
                   "50.1040", // Dammam
        serviceRadius: 25 + (index * 10), // Different service radius for each technician
        // Different pricing for each technician based on experience and rating
        installationPrice: 500 + (index * 100),
        maintenancePrice: 300 + (index * 50),
        assessmentPrice: 200 + (index * 50),
        createdAt: new Date()
      };
      this.technicians.set(technician.id, technician);
    });

    // Create some service requests
    const requestServiceTypes = ["installation", "maintenance", "assessment"];
    const propertyTypes = ["residential", "commercial"];
    
    for (let i = 0; i < 5; i++) {
      const serviceRequest: ServiceRequest = {
        id: this.currentIds.serviceRequest++,
        serviceType: requestServiceTypes[i % requestServiceTypes.length],
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+9669876543${i + 1}`,
        city: cities[i % cities.length],
        latitude: "24.774265",
        longitude: "46.738586",
        propertyType: propertyTypes[i % propertyTypes.length],
        additionalDetails: `Details for request ${i + 1}`,
        status: i < 2 ? "pending" : i < 4 ? "assigned" : "completed",
        // Ensure Technician ID 3 (Ahmed) has at least one service request
        technicianId: i === 4 ? 3 : (i < 2 ? null : (i % 3) + 1),
        price: i < 2 ? null : 300 + (i * 50), // Sample price
        isPaid: i === 4, // Only the completed one is paid
        paymentIntentId: i === 4 ? `pi_sample_${i}` : null,
        createdAt: new Date(Date.now() - i * 86400000) // Each a day apart
      };
      this.serviceRequests.set(serviceRequest.id, serviceRequest);
    }
    
    // Add one more service request specifically for Ahmed (technician ID 3)
    const ahmedServiceRequest: ServiceRequest = {
      id: this.currentIds.serviceRequest++,
      serviceType: "installation",
      name: "Mohammed Al-Qahtani",
      email: "m.qahtani@example.com",
      phone: "+966123456789",
      city: "Riyadh",
      latitude: "24.774265",
      longitude: "46.738586",
      propertyType: "residential",
      additionalDetails: "Need help with new solar panel installation",
      status: "assigned", // assigned to Ahmed
      technicianId: 3, // Ahmed's technician ID
      price: 2500,
      isPaid: false,
      paymentIntentId: null,
      createdAt: new Date(Date.now() - 2 * 86400000) // 2 days ago
    };
    this.serviceRequests.set(ahmedServiceRequest.id, ahmedServiceRequest);

    // Create some contact messages
    for (let i = 0; i < 3; i++) {
      const contact: Contact = {
        id: this.currentIds.contact++,
        name: `Contact Person ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        subject: `Question about solar ${i === 0 ? "installation" : i === 1 ? "maintenance" : "products"}`,
        message: `This is a sample message about solar energy services. Question ${i + 1}.`,
        responded: i < 1,
        createdAt: new Date(Date.now() - i * 86400000) // Each a day apart
      };
      this.contacts.set(contact.id, contact);
    }
    
    // Create sample reviews for each technician
    const reviewComments = [
      [
        "Mohammed did an excellent job installing our solar panels. He was punctual, professional, and the entire installation was completed in just two days. His knowledge about solar energy systems is impressive, and he took the time to explain everything to us.",
        "We had a great experience with Mohammed who installed solar panels on our villa. He was very meticulous and made sure everything was done correctly. The system has been working flawlessly since installation.",
        "I'm very satisfied with the solar panel installation. Mohammed was friendly, efficient, and cleaned up everything after completing the job. My energy bills have dropped significantly!",
        "Mohammed was recommended by a friend, and I'm glad I chose him for our solar panel installation. He was transparent about costs and timeline, and delivered exactly what was promised."
      ],
      [
        "Khaled was extremely thorough in his energy assessment. He identified several areas where we could improve efficiency and provided a detailed report with cost-effective solutions.",
        "I appreciated how Khaled explained complex energy concepts in simple terms. His recommendations were practical and have already resulted in noticeable savings on our electricity bill.",
        "The commercial energy assessment provided by Khaled was comprehensive and revealed inefficiencies we weren't aware of. His expertise in solar systems for businesses is outstanding.",
        "Khaled's assessment of our property was detailed and professional. He found several ways we could optimize our energy usage and provided clear steps for implementation."
      ],
      [
        "Ahmed quickly identified and fixed an issue with our solar inverter. His maintenance service was prompt, and he explained what went wrong and how to prevent future problems.",
        "Regular maintenance by Ahmed has kept our solar system running at peak efficiency. He's always responsive when we need him and very knowledgeable about troubleshooting.",
        "Ahmed saved us from a potentially expensive repair by identifying an early issue during routine maintenance. His attention to detail is impressive.",
        "When our solar system stopped working properly, Ahmed came the same day and resolved the issue quickly. His maintenance service is excellent and reasonably priced."
      ]
    ];
    
    const userNames = [
      ["Abdullah Al-Qahtani", "Saad Al-Shamrani", "Fahad Al-Otaibi", "Majid Al-Dosari"],
      ["Omar Al-Ghamdi", "Waleed Al-Shehri", "Nasser Al-Qahtani", "Saleh Al-Malki"],
      ["Ibrahim Al-Harbi", "Turki Al-Mutairi", "Saud Al-Sahli", "Bandar Al-Qahtani"]
    ];
    
    const ratings = [
      [5, 4, 5, 4],
      [5, 5, 5, 4],
      [4, 5, 4, 4]
    ];
    
    // Generate reviews for each technician
    for (let techIndex = 0; techIndex < 3; techIndex++) {
      const technicianId = techIndex + 1;
      
      // Each technician has 4 reviews
      for (let reviewIndex = 0; reviewIndex < 4; reviewIndex++) {
        const review: Review = {
          id: this.currentIds.review++,
          technicianId,
          userId: reviewIndex + 5, // Just random user IDs starting from 5
          userName: userNames[techIndex][reviewIndex],
          serviceType: techIndex === 0 ? "installation" : techIndex === 1 ? "assessment" : "maintenance",
          rating: ratings[techIndex][reviewIndex],
          comment: reviewComments[techIndex][reviewIndex],
          date: new Date(Date.now() - (reviewIndex * 7 + techIndex * 3) * 86400000) // Different dates for variety
        };
        
        this.reviews.set(review.id, review);
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || 'user',
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Technician methods
  async getTechnician(id: number): Promise<(Technician & { user: User }) | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;

    const user = await this.getUser(technician.userId);
    if (!user) return undefined;

    return { ...technician, user };
  }

  async getTechnicianByUserId(userId: number): Promise<Technician | undefined> {
    return Array.from(this.technicians.values()).find(
      (technician) => technician.userId === userId
    );
  }

  async getTechnicians(): Promise<(Technician & { user: User })[]> {
    const technicians = Array.from(this.technicians.values());
    const result: (Technician & { user: User })[] = [];

    for (const tech of technicians) {
      const user = await this.getUser(tech.userId);
      if (user) {
        result.push({ ...tech, user });
      }
    }

    return result;
  }

  async getFeaturedTechnicians(limit: number = 3): Promise<(Technician & { user: User })[]> {
    const allTechnicians = await this.getTechnicians();
    // Sort by rating (highest first) and limit
    return allTechnicians
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const id = this.currentIds.technician++;
    const technician: Technician = { 
      ...insertTechnician, 
      id, 
      reviewCount: 0,
      createdAt: new Date() 
    };
    this.technicians.set(id, technician);
    return technician;
  }

  async updateTechnician(id: number, technicianData: Partial<Technician>): Promise<Technician | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;
    
    const updatedTechnician = { ...technician, ...technicianData };
    this.technicians.set(id, updatedTechnician);
    return updatedTechnician;
  }

  async updateTechnicianRating(id: number, rating: number): Promise<Technician | undefined> {
    const technician = this.technicians.get(id);
    if (!technician) return undefined;
    
    const currentRating = technician.rating || 0;
    const currentReviews = technician.reviewCount || 0;
    
    // Calculate new rating
    const newRating = currentReviews === 0 
      ? rating 
      : (currentRating * currentReviews + rating) / (currentReviews + 1);
    
    const updatedTechnician = { 
      ...technician, 
      rating: newRating,
      reviewCount: currentReviews + 1
    };
    
    this.technicians.set(id, updatedTechnician);
    return updatedTechnician;
  }

  // Service Request methods
  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getServiceRequestsByTechnician(technicianId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .filter(request => request.technicianId === technicianId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserServiceRequests(userId: number): Promise<ServiceRequest[]> {
    // This would normally join with a user's service requests
    // For this demo, we'll just return all requests for simplicity
    return this.getServiceRequests();
  }

  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.currentIds.serviceRequest++;
    const serviceRequest: ServiceRequest = { 
      ...insertServiceRequest, 
      id, 
      status: "pending",
      technicianId: insertServiceRequest.technicianId || null,
      price: insertServiceRequest.price || null,
      isPaid: false,
      paymentIntentId: null,
      createdAt: new Date() 
    };
    this.serviceRequests.set(id, serviceRequest);
    return serviceRequest;
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const request = this.serviceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async assignTechnicianToServiceRequest(id: number, technicianId: number): Promise<ServiceRequest | undefined> {
    const request = this.serviceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      technicianId, 
      status: request.status === "pending" ? "assigned" : request.status 
    };
    
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async updateServiceRequestPaymentIntent(id: number, paymentIntentId: string): Promise<ServiceRequest | undefined> {
    const request = this.serviceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      paymentIntentId
    };
    
    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentIds.contact++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      responded: false,
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async markContactResponded(id: number, responded: boolean = true): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, responded };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByTechnician(technicianId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.technicianId === technicianId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentIds.review++;
    const review: Review = {
      ...insertReview,
      id,
      date: new Date()
    };
    this.reviews.set(id, review);
    
    // Update technician rating
    await this.updateTechnicianRating(insertReview.technicianId, insertReview.rating);
    
    return review;
  }
}

// Database implementation of the storage interface using Drizzle ORM
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      updatedAt: new Date()
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Technician methods
  async getTechnician(id: number): Promise<(Technician & { user: User }) | undefined> {
    const [technician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.id, id));

    if (!technician) return undefined;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, technician.userId));

    if (!user) return undefined;

    return { ...technician, user };
  }

  async getTechnicianByUserId(userId: number): Promise<Technician | undefined> {
    const [technician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.userId, userId));
    return technician || undefined;
  }

  async getTechnicians(): Promise<(Technician & { user: User })[]> {
    const techs = await db.select().from(technicians);
    const result: (Technician & { user: User })[] = [];

    for (const tech of techs) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, tech.userId));

      if (user) {
        result.push({ ...tech, user });
      }
    }

    return result;
  }

  async getFeaturedTechnicians(limit: number = 3): Promise<(Technician & { user: User })[]> {
    const techs = await db
      .select()
      .from(technicians)
      .orderBy(desc(technicians.rating))
      .limit(limit);

    const result: (Technician & { user: User })[] = [];

    for (const tech of techs) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, tech.userId));

      if (user) {
        result.push({ ...tech, user });
      }
    }

    return result;
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const [technician] = await db
      .insert(technicians)
      .values({
        ...insertTechnician,
        updatedAt: new Date(),
      })
      .returning();
    return technician;
  }

  async updateTechnician(id: number, technicianData: Partial<Technician>): Promise<Technician | undefined> {
    const [technician] = await db
      .update(technicians)
      .set({
        ...technicianData,
        updatedAt: new Date(),
      })
      .where(eq(technicians.id, id))
      .returning();
    return technician || undefined;
  }

  async updateTechnicianRating(id: number, rating: number): Promise<Technician | undefined> {
    // Get the current technician
    const [technician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.id, id));

    if (!technician) return undefined;

    // Calculate new rating
    const currentRating = technician.rating || 0;
    const currentReviews = technician.reviewCount || 0;
    const newRating = currentReviews === 0
      ? rating
      : (currentRating * currentReviews + rating) / (currentReviews + 1);

    // Update the technician with new rating
    const [updatedTechnician] = await db
      .update(technicians)
      .set({
        rating: newRating,
        reviewCount: currentReviews + 1,
        updatedAt: new Date(),
      })
      .where(eq(technicians.id, id))
      .returning();

    return updatedTechnician || undefined;
  }

  // Service Request methods
  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return serviceRequest || undefined;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequestsByTechnician(technicianId: number): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.technicianId, technicianId))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getUserServiceRequests(userId: number): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.userId, userId))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .insert(serviceRequests)
      .values({
        ...insertServiceRequest,
        updatedAt: new Date(),
      })
      .returning();
    return serviceRequest;
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        status: status as any, // Type cast to handle enum
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest || undefined;
  }

  async assignTechnicianToServiceRequest(id: number, technicianId: number): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        technicianId,
        status: 'assigned' as any, // Type cast to handle enum
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest || undefined;
  }

  async updateServiceRequestPaymentIntent(id: number, paymentIntentId: string): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({
        paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest || undefined;
  }

  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact || undefined;
  }

  async getContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values({
        ...insertContact,
        updatedAt: new Date(),
      })
      .returning();
    return contact;
  }

  async markContactResponded(id: number, responded: boolean = true): Promise<Contact | undefined> {
    const [contact] = await db
      .update(contacts)
      .set({
        responded,
        respondedAt: responded ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, id))
      .returning();
    return contact || undefined;
  }

  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewsByTechnician(technicianId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.technicianId, technicianId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        updatedAt: new Date(),
      })
      .returning();
    
    // Update technician rating
    await this.updateTechnicianRating(review.technicianId, review.rating);
    
    return review;
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
