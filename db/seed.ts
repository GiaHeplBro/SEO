import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log("Starting database seed...");

    // Seed users
    const users = await seedUsers();
    console.log(`Created ${users.length} users`);

    // Seed clients
    const clients = await seedClients();
    console.log(`Created ${clients.length} clients`);

    // Seed tasks
    const tasks = await seedTasks(clients, users);
    console.log(`Created ${tasks.length} tasks`);

    // Seed activities
    const activities = await seedActivities(clients, users);
    console.log(`Created ${activities.length} client activities`);

    // Seed compliance metrics
    const metrics = await seedComplianceMetrics(users);
    console.log(`Created ${metrics.length} compliance metrics`);

    // Seed audit logs
    const logs = await seedAuditLogs(clients, users, tasks);
    console.log(`Created ${logs.length} audit logs`);

    // Seed settings
    const settings = await seedSettings(users);
    console.log(`Created ${settings.length} settings`);

    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function seedUsers() {
  // Check if users already exist
  const existingUsers = await db.select().from(schema.users);
  if (existingUsers.length > 0) {
    console.log("Users already exist, skipping user creation");
    return existingUsers;
  }

  const defaultPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      username: "alex.morgan",
      password: defaultPassword,
      fullName: "Alex Morgan",
      email: "alex.morgan@example.com",
      role: "manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      username: "sarah.chen",
      password: defaultPassword,
      fullName: "Sarah Chen",
      email: "sarah.chen@example.com",
      role: "manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      username: "james.wilson",
      password: defaultPassword,
      fullName: "James Wilson",
      email: "james.wilson@example.com",
      role: "manager",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  return await db.insert(schema.users).values(usersData).returning();
}

async function seedClients() {
  // Check if clients already exist
  const existingClients = await db.select().from(schema.clients);
  if (existingClients.length > 0) {
    console.log("Clients already exist, skipping client creation");
    return existingClients;
  }

  const clientsData = [
    {
      name: "Acme Corp",
      industry: "Technology",
      contactName: "John Doe",
      contactEmail: "john@acmecorp.com",
      contactPhone: "555-123-4567",
      address: "123 Tech Ave, San Francisco, CA 94107",
      notes: "Key client with multiple projects. Interested in expanding services.",
    },
    {
      name: "TechDev Inc",
      industry: "Software",
      contactName: "Jane Smith",
      contactEmail: "jane@techdev.com",
      contactPhone: "555-987-6543",
      address: "456 Innovation Dr, Austin, TX 78701",
      notes: "Started with a small project, growing relationship.",
    },
    {
      name: "Global Logistics",
      industry: "Transportation",
      contactName: "Robert Johnson",
      contactEmail: "robert@globallogistics.com",
      contactPhone: "555-456-7890",
      address: "789 Transport Blvd, Chicago, IL 60607",
      notes: "Long-term client with complex logistics needs.",
    },
    {
      name: "Summit Group",
      industry: "Financial",
      contactName: "Maria Garcia",
      contactEmail: "maria@summitgroup.com",
      contactPhone: "555-234-5678",
      address: "101 Finance St, New York, NY 10004",
      notes: "High-value client requiring extra compliance attention.",
    },
    {
      name: "Northern Healthcare",
      industry: "Healthcare",
      contactName: "David Kim",
      contactEmail: "david@northernhealth.com",
      contactPhone: "555-876-5432",
      address: "202 Medical Ctr, Boston, MA 02115",
      notes: "Sensitive healthcare data, ensure compliance with HIPAA.",
    },
    {
      name: "EcoFriendly Solutions",
      industry: "Environmental",
      contactName: "Lisa Patel",
      contactEmail: "lisa@ecofriendly.com",
      contactPhone: "555-345-6789",
      address: "303 Green Ave, Portland, OR 97201",
      notes: "Committed to sustainability practices.",
    },
    {
      name: "Creative Designs",
      industry: "Marketing",
      contactName: "Thomas Wright",
      contactEmail: "thomas@creativedesigns.com",
      contactPhone: "555-654-3210",
      address: "404 Creative Ln, Los Angeles, CA 90210",
      notes: "Innovative marketing client with quick turnaround needs.",
    },
    {
      name: "Precision Manufacturing",
      industry: "Manufacturing",
      contactName: "Sarah Johnson",
      contactEmail: "sarah@precisionmfg.com",
      contactPhone: "555-789-0123",
      address: "505 Industrial Way, Detroit, MI 48201",
      notes: "Requires detailed project specifications.",
    }
  ];

  return await db.insert(schema.clients).values(clientsData).returning();
}

async function seedTasks(clients: any[], users: any[]) {
  // Check if tasks already exist
  const existingTasks = await db.select().from(schema.tasks);
  if (existingTasks.length > 0) {
    console.log("Tasks already exist, skipping task creation");
    return existingTasks;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0); // 2:00 PM today
  const today430 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30, 0); // 4:30 PM today
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0); // 10:00 AM tomorrow
  const tomorrow2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0); // 2:00 PM tomorrow
  const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 11, 0, 0); // 11:00 AM next week

  const tasksData = [
    {
      clientId: clients[0].id, // Acme Corp
      assignedToId: users[0].id,
      description: "Contract renewal discussion",
      dueDate: today,
      priority: "high",
      status: "pending",
      notes: "Prepare renewal pricing options and service upgrades.",
    },
    {
      clientId: clients[1].id, // TechDev Inc
      assignedToId: users[0].id,
      description: "Follow up on proposal",
      dueDate: today430,
      priority: "medium",
      status: "pending",
      notes: "Check if they have any questions about the proposal we sent last week.",
    },
    {
      clientId: clients[2].id, // Global Logistics
      assignedToId: users[1].id,
      description: "Quarterly review meeting",
      dueDate: tomorrow,
      priority: "normal",
      status: "scheduled",
      notes: "Review Q3 performance and discuss Q4 goals.",
    },
    {
      clientId: clients[3].id, // Summit Group
      assignedToId: users[1].id,
      description: "Send updated service agreement",
      dueDate: tomorrow2,
      priority: "high",
      status: "in progress",
      notes: "Legal department approved the draft, needs final review before sending.",
    },
    {
      clientId: clients[4].id, // Northern Healthcare
      assignedToId: users[2].id,
      description: "Budget approval discussion",
      dueDate: nextWeek,
      priority: "medium",
      status: "scheduled",
      notes: "Prepare three budget scenarios for the new project.",
    },
    {
      clientId: clients[5].id, // EcoFriendly
      assignedToId: users[2].id,
      description: "Present sustainability report",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 13, 0, 0),
      priority: "normal",
      status: "pending",
      notes: "Final report review needed before presentation.",
    },
    {
      clientId: clients[6].id, // Creative Designs
      assignedToId: users[0].id,
      description: "Review campaign performance",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0, 0),
      priority: "high",
      status: "pending",
      notes: "Analyze metrics from the latest campaign.",
    },
    {
      clientId: clients[7].id, // Precision Manufacturing
      assignedToId: users[1].id,
      description: "Quality assurance follow-up",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 30, 0),
      priority: "medium",
      status: "pending",
      notes: "Discuss recent QA findings and improvements.",
    }
  ];

  // Create completed tasks
  const completedTasksData = [
    {
      clientId: clients[0].id, // Acme Corp
      assignedToId: users[0].id,
      description: "Initial meeting with CTO",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 10, 0, 0),
      priority: "high",
      status: "completed",
      notes: "Discussed technical requirements and timeline.",
      completedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 11, 30, 0),
      completedById: users[0].id
    },
    {
      clientId: clients[2].id, // Global Logistics
      assignedToId: users[1].id,
      description: "Logistics system review",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 14, 0, 0),
      priority: "medium",
      status: "completed",
      notes: "Audited current system and identified areas for improvement.",
      completedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 16, 0, 0),
      completedById: users[1].id
    },
    {
      clientId: clients[3].id, // Summit Group
      assignedToId: users[2].id,
      description: "Financial compliance review",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 9, 0, 0),
      priority: "high",
      status: "completed",
      notes: "Reviewed all compliance documentation and found no issues.",
      completedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 17, 0, 0),
      completedById: users[2].id
    }
  ];

  return await db.insert(schema.tasks).values([...tasksData, ...completedTasksData]).returning();
}

async function seedActivities(clients: any[], users: any[]) {
  // Check if activities already exist
  const existingActivities = await db.select().from(schema.activities);
  if (existingActivities.length > 0) {
    console.log("Activities already exist, skipping activity creation");
    return existingActivities;
  }

  const now = new Date();
  
  const activitiesData = [
    {
      clientId: clients[0].id, // Acme Corp
      userId: users[0].id,
      type: "client-reply",
      message: "<span class=\"font-medium\">Acme Corp</span> replied to your proposal",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      clientId: clients[3].id, // Summit Group
      userId: users[1].id,
      type: "approval",
      message: "<span class=\"font-medium\">Summit Group</span> approved the contract",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      clientId: clients[1].id, // TechDev Inc
      userId: users[0].id,
      type: "meeting-scheduled",
      message: "<span class=\"font-medium\">You</span> scheduled a meeting with <span class=\"font-medium\">TechDev Inc</span>",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000 - 40 * 60 * 1000), // Yesterday, 3:40 PM
    },
    {
      clientId: clients[4].id, // Northern Healthcare
      userId: users[2].id,
      type: "information-request",
      message: "<span class=\"font-medium\">Northern Healthcare</span> requested additional information",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 11 * 60 * 60 * 1000 - 15 * 60 * 1000), // Yesterday, 11:15 AM
    },
    {
      clientId: clients[2].id, // Global Logistics
      userId: users[1].id,
      type: "issue-flagged",
      message: "<span class=\"font-medium\">Global Logistics</span> flagged an issue with the service",
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 16, 20, 0), // Oct 12, 4:20 PM (using relative date)
    }
  ];

  return await db.insert(schema.activities).values(activitiesData).returning();
}

async function seedComplianceMetrics(users: any[]) {
  // Check if compliance metrics already exist
  const existingMetrics = await db.select().from(schema.complianceMetrics);
  if (existingMetrics.length > 0) {
    console.log("Compliance metrics already exist, skipping metrics creation");
    return existingMetrics;
  }

  const metricsData = [
    {
      name: "Audit Logs",
      category: "Documentation",
      score: 100,
      targetScore: 100,
      updatedById: users[0].id,
      notes: "All audit logs properly maintained"
    },
    {
      name: "Client Documentation",
      category: "Documentation",
      score: 82,
      targetScore: 100,
      updatedById: users[0].id,
      notes: "Missing some client documents"
    },
    {
      name: "Data Privacy",
      category: "Security",
      score: 98,
      targetScore: 100,
      updatedById: users[1].id,
      notes: "Minor improvements needed in data handling"
    },
    {
      name: "Communication Records",
      category: "Documentation",
      score: 64,
      targetScore: 100,
      updatedById: users[2].id,
      notes: "3 clients missing follow-up documentation"
    }
  ];

  return await db.insert(schema.complianceMetrics).values(metricsData).returning();
}

async function seedAuditLogs(clients: any[], users: any[], tasks: any[]) {
  // Check if audit logs already exist
  const existingLogs = await db.select().from(schema.auditLogs);
  if (existingLogs.length > 0) {
    console.log("Audit logs already exist, skipping log creation");
    return existingLogs;
  }

  const now = new Date();
  
  const logsData = [
    {
      userId: users[0].id,
      clientId: clients[0].id,
      action: "Created",
      resourceType: "task",
      resourceId: tasks[0].id.toString(),
      details: "Created a new follow-up task",
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 35, 22),
    },
    {
      userId: users[1].id,
      clientId: clients[3].id,
      action: "Updated",
      resourceType: "client",
      resourceId: clients[3].id.toString(),
      details: "Updated client contact information",
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 15, 40),
    },
    {
      userId: users[0].id,
      clientId: clients[1].id,
      action: "Viewed",
      resourceType: "client",
      resourceId: clients[1].id.toString(),
      details: "Viewed client history records",
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 42, 18),
    },
    {
      userId: users[2].id,
      clientId: clients[4].id,
      action: "Modified",
      resourceType: "task",
      resourceId: tasks[4].id.toString(),
      details: "Changed task priority from Normal to Medium",
      timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 30, 5),
    }
  ];

  return await db.insert(schema.auditLogs).values(logsData).returning();
}

async function seedSettings(users: any[]) {
  // Check if settings already exist
  const existingSettings = await db.select().from(schema.settings);
  if (existingSettings.length > 0) {
    console.log("Settings already exist, skipping settings creation");
    return existingSettings;
  }

  const settingsData = [
    {
      category: "general",
      key: "companyName",
      value: "ClientTrack PM",
      updatedById: users[0].id
    },
    {
      category: "general",
      key: "emailAddress",
      value: "contact@clienttrackpm.com",
      updatedById: users[0].id
    },
    {
      category: "general",
      key: "notificationPreferences",
      value: { email: true, inApp: true },
      updatedById: users[0].id
    },
    {
      category: "general",
      key: "defaultTaskReminder",
      value: "1day",
      updatedById: users[0].id
    },
    {
      category: "audit",
      key: "retentionPeriod",
      value: "90days",
      updatedById: users[0].id
    },
    {
      category: "audit",
      key: "logTaskCompletions",
      value: true,
      updatedById: users[0].id
    },
    {
      category: "audit",
      key: "logClientInteractions",
      value: true,
      updatedById: users[0].id
    },
    {
      category: "audit",
      key: "logDataExports",
      value: true,
      updatedById: users[0].id
    },
    {
      category: "audit",
      key: "enableDetailedLogs",
      value: true,
      updatedById: users[0].id
    }
  ];

  return await db.insert(schema.settings).values(settingsData).returning();
}

seed();
