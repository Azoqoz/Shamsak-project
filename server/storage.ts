import { 
  User, 
  InsertUser, 
  Technician, 
  InsertTechnician, 
  ServiceRequest, 
  InsertServiceRequest, 
  Contact, 
  InsertContact 
} from "@shared/schema";

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
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private technicians: Map<number, Technician>;
  private serviceRequests: Map<number, ServiceRequest>;
  private contacts: Map<number, Contact>;
  private currentIds: {
    user: number;
    technician: number;
    serviceRequest: number;
    contact: number;
  };

  constructor() {
    this.users = new Map();
    this.technicians = new Map();
    this.serviceRequests = new Map();
    this.contacts = new Map();
    this.currentIds = {
      user: 1,
      technician: 1,
      serviceRequest: 1,
      contact: 1
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
        experience: `${5 + index} years`,
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
        // Different pricing for each technician based on experience and rating
        installationPrice: 500 + (index * 100),
        maintenancePrice: 300 + (index * 50),
        assessmentPrice: 200 + (index * 50),
        createdAt: new Date()
      };
      this.technicians.set(technician.id, technician);
    });

    // Create some service requests
    const serviceTypes = ["installation", "maintenance", "assessment"];
    const propertyTypes = ["residential", "commercial"];
    
    for (let i = 0; i < 5; i++) {
      const serviceRequest: ServiceRequest = {
        id: this.currentIds.serviceRequest++,
        serviceType: serviceTypes[i % serviceTypes.length],
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+9669876543${i + 1}`,
        city: cities[i % cities.length],
        propertyType: propertyTypes[i % propertyTypes.length],
        additionalDetails: `Details for request ${i + 1}`,
        status: i < 2 ? "pending" : i < 4 ? "assigned" : "completed",
        technicianId: i < 2 ? null : (i % 3) + 1,
        price: i < 2 ? null : 300 + (i * 50), // Sample price
        isPaid: i === 4, // Only the completed one is paid
        paymentIntentId: i === 4 ? `pi_sample_${i}` : null,
        createdAt: new Date(Date.now() - i * 86400000) // Each a day apart
      };
      this.serviceRequests.set(serviceRequest.id, serviceRequest);
    }

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
    const user: User = { ...insertUser, id, createdAt: new Date() };
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
}

export const storage = new MemStorage();
