import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, time, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table (inherited from the existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").default("user").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
  tasks: many(tasks),
}));

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clientsRelations = relations(clients, ({ many }) => ({
  tasks: many(tasks),
  activities: many(activities),
  interactions: many(clientInteractions),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").notNull(), // high, medium, normal, low
  status: text("status").notNull(), // pending, in progress, scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  completedById: integer("completed_by_id").references(() => users.id),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  completedBy: one(users, {
    fields: [tasks.completedById],
    references: [users.id],
  }),
}));

// Client Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // client-reply, approval, meeting-scheduled, information-request, issue-flagged
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Additional info specific to the activity type
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  client: one(clients, {
    fields: [activities.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Client Interactions (for detailed tracking)
export const clientInteractions = pgTable("client_interactions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // email, call, meeting, note
  title: text("title").notNull(),
  description: text("description"),
  interactionDate: timestamp("interaction_date").notNull(),
  followUpTaskId: integer("follow_up_task_id").references(() => tasks.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientInteractionsRelations = relations(clientInteractions, ({ one }) => ({
  client: one(clients, {
    fields: [clientInteractions.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [clientInteractions.userId],
    references: [users.id],
  }),
  followUpTask: one(tasks, {
    fields: [clientInteractions.followUpTaskId],
    references: [tasks.id],
  }),
}));

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  action: text("action").notNull(), // created, updated, viewed, modified, deleted
  resourceType: text("resource_type").notNull(), // client, task, user, setting
  resourceId: text("resource_id"), // ID of the affected resource
  details: text("details").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Additional structured data about the action
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [auditLogs.clientId],
    references: [clients.id],
  }),
}));

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // general, audit, notification
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedById: integer("updated_by_id").references(() => users.id).notNull(),
});

export const settingsRelations = relations(settings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [settings.updatedById],
    references: [users.id],
  }),
}));

// Compliance Metrics
export const complianceMetrics = pgTable("compliance_metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  targetScore: integer("target_score").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  updatedById: integer("updated_by_id").references(() => users.id),
  notes: text("notes"),
});

export const complianceMetricsRelations = relations(complianceMetrics, ({ one }) => ({
  updatedBy: one(users, {
    fields: [complianceMetrics.updatedById],
    references: [users.id],
  }),
}));

// Schema validation with Zod
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
  fullName: (schema) => schema.min(2, "Full name must be at least 2 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
});

export const insertClientSchema = createInsertSchema(clients, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  contactName: (schema) => schema.min(2, "Contact name must be at least 2 characters"),
  contactEmail: (schema) => schema.email("Must provide a valid email"),
  contactPhone: (schema) => schema.min(5, "Contact phone must be at least 5 characters"),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  description: (schema) => schema.min(5, "Description must be at least 5 characters"),
});

export const insertActivitySchema = createInsertSchema(activities);
export const insertClientInteractionSchema = createInsertSchema(clientInteractions);
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const insertSettingSchema = createInsertSchema(settings);
export const insertComplianceMetricSchema = createInsertSchema(complianceMetrics);

// Exported types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ClientInteraction = typeof clientInteractions.$inferSelect;
export type InsertClientInteraction = z.infer<typeof insertClientInteractionSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type ComplianceMetric = typeof complianceMetrics.$inferSelect;
export type InsertComplianceMetric = z.infer<typeof insertComplianceMetricSchema>;
