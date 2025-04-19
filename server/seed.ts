import { db } from "./db";
import { 
  users, 
  technicians, 
  serviceRequests, 
  contacts, 
  reviews, 
  serviceTypes 
} from "../shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // First check if data already exists
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Data already exists. Skipping seed operation.");
      return;
    }

    // 1. Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: "admin123", // In production, this would be hashed
      role: "admin",
      name: "Admin User",
      email: "admin@shamsak.sa",
      phone: "+966 51 234 567",
      city: "Riyadh",
      address: "Al Olaya Street",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log("Created admin user:", adminUser);

    // 2. Create service types
    await db.insert(serviceTypes).values([
      {
        name: "Solar Panel Installation",
        description: "Complete installation of solar panel systems for residential and commercial properties",
        basePrice: 5000,
        icon: "solar-panel",
      },
      {
        name: "Solar System Maintenance",
        description: "Regular maintenance and checkups for existing solar installations",
        basePrice: 800,
        icon: "wrench",
      },
      {
        name: "Energy Efficiency Assessment",
        description: "Comprehensive assessment of property energy usage and solar potential",
        basePrice: 1200,
        icon: "clipboard-check",
      },
      {
        name: "Solar System Repair",
        description: "Troubleshooting and repair of solar system issues",
        basePrice: 1500,
        icon: "tool",
      },
    ]);

    // 3. Create technician users and profiles
    const technicianData = [
      {
        user: {
          username: "mohammed",
          password: "tech123", // In production, this would be hashed
          role: "technician",
          name: "Mohammed Al-Harbi",
          email: "mohammed@shamsak.sa",
          phone: "+966 51 234 111",
          city: "Riyadh",
          address: "King Fahd Road",
        },
        technician: {
          specialty: "Solar Panel Installation",
          experience: "7 years",
          certifications: "Saudi Renewable Energy Certificate, Advanced Solar Installation",
          bio: "Experienced solar technician specializing in residential solar panel installation with 7 years of experience working with top brands.",
          rating: 5, // Integer values only for rating
          reviewCount: 32,
          latitude: "24.7136",
          longitude: "46.6753",
          serviceRadius: 30,
          installationPrice: 600,
          maintenancePrice: 350,
          assessmentPrice: 250,
        }
      },
      {
        user: {
          username: "khaled",
          password: "tech123", // In production, this would be hashed
          role: "technician",
          name: "Khaled Al-Ghamdi",
          email: "khaled@shamsak.sa",
          phone: "+966 51 234 222",
          city: "Jeddah",
          address: "Al Andalus District",
        },
        technician: {
          specialty: "Energy Efficiency Assessment",
          experience: "8 years",
          certifications: "Energy Efficiency Expert, Solar System Designer",
          bio: "Energy efficiency expert with 8 years of experience in commercial solar systems and comprehensive energy assessments.",
          rating: 5, // Integer values only for rating
          reviewCount: 45,
          latitude: "21.4858",
          longitude: "39.1925",
          serviceRadius: 35,
          installationPrice: 700,
          maintenancePrice: 400,
          assessmentPrice: 300,
        }
      },
      {
        user: {
          username: "ahmed",
          password: "tech123", // In production, this would be hashed
          role: "technician",
          name: "Ahmed Al-Otaibi",
          email: "ahmed@shamsak.sa",
          phone: "+966 51 234 333",
          city: "Dammam",
          address: "Al Faisaliyah District",
        },
        technician: {
          specialty: "Maintenance and Repair",
          experience: "6 years",
          certifications: "Solar System Maintenance Specialist",
          bio: "Specialized in maintenance and troubleshooting of solar systems with 6 years of hands-on experience fixing complex issues.",
          rating: 5, // Integer values only for rating
          reviewCount: 28,
          latitude: "26.4367",
          longitude: "50.1040",
          serviceRadius: 25,
          installationPrice: 550,
          maintenancePrice: 300,
          assessmentPrice: 200,
        }
      }
    ];

    for (const data of technicianData) {
      // Create technician user
      const [user] = await db.insert(users).values({
        ...data.user,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // Create technician profile
      const [technician] = await db.insert(technicians).values({
        ...data.technician,
        userId: user.id,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      console.log(`Created technician: ${user.name} (ID: ${technician.id})`);
    }

    // 4. Create regular user
    const [regularUser] = await db.insert(users).values({
      username: "customer",
      password: "pass123", // In production, this would be hashed
      role: "user",
      name: "Abdullah Al-Qahtani",
      email: "abdullah@example.com",
      phone: "+966 51 234 444",
      city: "Riyadh",
      address: "Al Nakheel District",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log("Created regular user:", regularUser);

    // 5. Create service requests
    const [serviceRequest1] = await db.insert(serviceRequests).values({
      userId: regularUser.id,
      technicianId: 1, // Mohammed
      serviceType: "installation", // Note: using string here since it's an enum
      propertyType: "residential",
      title: "Solar panel installation for villa",
      description: "Need installation of 10kW solar system for my residential villa",
      address: "Al Yasmin District, Street 15",
      city: "Riyadh",
      status: "completed",
      price: 12000,
      isPaid: true,
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }).returning();

    const [serviceRequest2] = await db.insert(serviceRequests).values({
      userId: regularUser.id,
      technicianId: null,
      serviceType: "maintenance",
      propertyType: "residential",
      title: "Annual maintenance for solar system",
      description: "Need regular maintenance for my existing solar panel installation",
      address: "Al Yasmin District, Street 15",
      city: "Riyadh",
      status: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    }).returning();

    console.log("Created service requests:", serviceRequest1.id, serviceRequest2.id);

    // 6. Create reviews
    await db.insert(reviews).values([
      {
        technicianId: 1, // Mohammed
        userId: regularUser.id,
        serviceRequestId: serviceRequest1.id,
        userName: regularUser.name,
        serviceType: "installation",
        rating: 5,
        comment: "Mohammed did an excellent job installing our solar panels. He was punctual, professional, and the entire installation was completed in just two days. His knowledge about solar energy systems is impressive, and he took the time to explain everything to us.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        technicianId: 1, // Mohammed
        userId: null,
        serviceRequestId: null,
        userName: "Saad Al-Shamrani",
        serviceType: "installation",
        rating: 4,
        comment: "We had a great experience with Mohammed who installed solar panels on our villa. He was very meticulous and made sure everything was done correctly. The system has been working flawlessly since installation.",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        technicianId: 2, // Khaled
        userId: null,
        serviceRequestId: null,
        userName: "Omar Al-Ghamdi",
        serviceType: "assessment",
        rating: 5,
        comment: "Khaled was extremely thorough in his energy assessment. He identified several areas where we could improve efficiency and provided a detailed report with cost-effective solutions.",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      },
      {
        technicianId: 3, // Ahmed
        userId: null,
        serviceRequestId: null,
        userName: "Ibrahim Al-Harbi",
        serviceType: "maintenance",
        rating: 4,
        comment: "Ahmed quickly identified and fixed an issue with our solar inverter. His maintenance service was prompt, and he explained what went wrong and how to prevent future problems.",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
    ]);

    console.log("Created reviews");

    // 7. Create contact submissions
    await db.insert(contacts).values([
      {
        name: "Fahad Al-Otaibi",
        email: "fahad@example.com",
        subject: "Question about installation cost",
        message: "I am interested in installing solar panels for my business. Could you provide an estimate of the costs and potential savings?",
        responded: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        name: "Majid Al-Dosari",
        email: "majid@example.com",
        subject: "Solar system maintenance inquiry",
        message: "My solar panels were installed 2 years ago and I've never had them serviced. What kind of maintenance do they need and how often?",
        responded: true,
        respondedBy: adminUser.id,
        responseMessage: "Thank you for your inquiry. We recommend annual maintenance for solar panel systems to ensure optimal performance. I've sent you details about our maintenance packages by email.",
        respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ]);

    console.log("Created contacts");
    console.log("Database seeded successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();