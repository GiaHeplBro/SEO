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

// SEO Website Table - Stores websites being analyzed
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  industryType: varchar("industry_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  seoScore: integer("seo_score"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
});

export const websitesRelations = relations(websites, ({ one, many }) => ({
  user: one(users, {
    fields: [websites.userId],
    references: [users.id],
  }),
  seoAudits: many(seoAudits),
  keywords: many(keywords),
}));

// SEO Audit Table - Stores website audit results
export const seoAudits = pgTable("seo_audits", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id).notNull(),
  auditDate: timestamp("audit_date").defaultNow().notNull(),
  overallScore: integer("overall_score").notNull(),
  metaData: jsonb("meta_data"), // Title tags, meta descriptions, etc.
  contentData: jsonb("content_data"), // Content quality, headings, etc.
  technicalData: jsonb("technical_data"), // Page speed, mobile-friendliness, etc.
  backlinkData: jsonb("backlink_data"), // Backlink quality and quantity
  criteriaResults: jsonb("criteria_results"), // Detailed breakdown of audit results
  recommendations: jsonb("recommendations"), // Specific improvement recommendations
});

export const seoAuditsRelations = relations(seoAudits, ({ one }) => ({
  website: one(websites, {
    fields: [seoAudits.websiteId],
    references: [websites.id],
  }),
}));

// Keywords Table - Stores tracked keywords
export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id).notNull(),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"), // 0-100 scale
  currentRanking: integer("current_ranking"),
  previousRanking: integer("previous_ranking"),
  searchIntent: varchar("search_intent", { length: 50 }),
  cpc: decimal("cpc", { precision: 10, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  competition: varchar("competition", { length: 50 }),
  trending: varchar("trending", { length: 20 }),
  status: varchar("status", { length: 20 }).default("tracking").notNull(),
});

export const keywordsRelations = relations(keywords, ({ one }) => ({
  website: one(websites, {
    fields: [keywords.websiteId],
    references: [websites.id],
  }),
}));

// Backlinks Table - Stores backlink data
export const backlinks = pgTable("backlinks", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id).notNull(),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: text("anchor_text"),
  firstDiscovered: timestamp("first_discovered").defaultNow().notNull(),
  lastChecked: timestamp("last_checked").defaultNow().notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  doFollow: boolean("do_follow").default(true).notNull(),
  domainAuthority: integer("domain_authority"),
  pageAuthority: integer("page_authority"),
  toxicityScore: integer("toxicity_score"),
  sourceTraffic: integer("source_traffic"),
});

export const backlinksRelations = relations(backlinks, ({ one }) => ({
  website: one(websites, {
    fields: [backlinks.websiteId],
    references: [websites.id],
  }),
}));

// Content Optimizations Table - Stores content optimization history
export const contentOptimizations = pgTable("content_optimizations", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id).notNull(),
  pageUrl: text("page_url").notNull(),
  targetKeyword: text("target_keyword").notNull(),
  originalContent: text("original_content"),
  optimizedContent: text("optimized_content"),
  seoScore: integer("seo_score"),
  readabilityScore: integer("readability_score"),
  optimizationDate: timestamp("optimization_date").defaultNow().notNull(),
  optimizationSettings: jsonb("optimization_settings"), // User's settings for optimization
  aiGenerationPrompt: text("ai_generation_prompt"),
  suggestions: jsonb("suggestions"), // List of improvement suggestions
});

export const contentOptimizationsRelations = relations(contentOptimizations, ({ one }) => ({
  website: one(websites, {
    fields: [contentOptimizations.websiteId],
    references: [websites.id],
  }),
}));

// On-Page Optimizations Table - Stores on-page element optimizations
export const onPageOptimizations = pgTable("on_page_optimizations", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id).notNull(),
  pageUrl: text("page_url").notNull(),
  elementType: varchar("element_type", { length: 50 }).notNull(), // title, meta_description, h1, etc.
  originalValue: text("original_value"),
  optimizedValue: text("optimized_value"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, applied, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  appliedAt: timestamp("applied_at"),
  recommendations: text("recommendations"),
  importance: integer("importance"), // 0-100 scale
});

export const onPageOptimizationsRelations = relations(onPageOptimizations, ({ one }) => ({
  website: one(websites, {
    fields: [onPageOptimizations.websiteId],
    references: [websites.id],
  }),
}));

// Create insert schemas for validation
export const insertWebsiteSchema = createInsertSchema(websites, {
  url: (schema) => schema.url("Must provide a valid URL").min(5, "URL must be at least 5 characters"),
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
});

export const insertSeoAuditSchema = createInsertSchema(seoAudits);
export const insertKeywordSchema = createInsertSchema(keywords);
export const insertBacklinkSchema = createInsertSchema(backlinks);
export const insertContentOptimizationSchema = createInsertSchema(contentOptimizations);
export const insertOnPageOptimizationSchema = createInsertSchema(onPageOptimizations);

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

// New SEO types
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type SeoAudit = typeof seoAudits.$inferSelect;
export type InsertSeoAudit = z.infer<typeof insertSeoAuditSchema>;

export type Keyword = typeof keywords.$inferSelect;
export type InsertKeyword = z.infer<typeof insertKeywordSchema>;

export type Backlink = typeof backlinks.$inferSelect;
export type InsertBacklink = z.infer<typeof insertBacklinkSchema>;

export type ContentOptimization = typeof contentOptimizations.$inferSelect;
export type InsertContentOptimization = z.infer<typeof insertContentOptimizationSchema>;

export type OnPageOptimization = typeof onPageOptimizations.$inferSelect;
export type InsertOnPageOptimization = z.infer<typeof insertOnPageOptimizationSchema>;
