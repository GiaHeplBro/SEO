import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, or, desc, asc, like, sql, gt, lt, gte, lte, isNull, isNotNull } from "drizzle-orm";
import { z } from "zod";

export class DashboardMetrics {
  /**
   * Get dashboard metrics
   */
  static async getMetrics() {
    try {
      // Active clients count
      const activeClientsQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.clients);
      const activeClientsCount = activeClientsQuery[0]?.count || 0;

      // Calculate client trend (monthly increase percentage)
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const lastMonthClientsQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.clients)
        .where(gte(schema.clients.createdAt, lastMonthDate));
      const lastMonthClientsCount = lastMonthClientsQuery[0]?.count || 0;
      
      const clientTrend = {
        value: `${Math.round((lastMonthClientsCount / activeClientsCount) * 100)}%`,
        direction: lastMonthClientsCount > 0 ? "up" : "neutral",
        label: "from last month"
      };

      // Pending tasks count
      const pendingTasksQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(and(
          eq(schema.tasks.status, "pending"),
          isNull(schema.tasks.completedAt)
        ));
      const pendingTasksCount = pendingTasksQuery[0]?.count || 0;

      // Calculate task trend
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      
      const lastWeekTasksQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(and(
          eq(schema.tasks.status, "pending"),
          gte(schema.tasks.createdAt, lastWeekDate)
        ));
      const lastWeekTasksCount = lastWeekTasksQuery[0]?.count || 0;
      
      const taskTrend = {
        value: `${Math.round((lastWeekTasksCount / (pendingTasksCount || 1)) * 100)}%`,
        direction: "up", // For design purposes, this could be dynamic based on business logic
        label: "from last week"
      };

      // Follow-ups today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const followUpsQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(and(
          gte(schema.tasks.dueDate, today),
          lt(schema.tasks.dueDate, tomorrow),
          isNull(schema.tasks.completedAt)
        ));
      const followUpsCount = followUpsQuery[0]?.count || 0;

      // High priority follow-ups
      const highPriorityQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(and(
          gte(schema.tasks.dueDate, today),
          lt(schema.tasks.dueDate, tomorrow),
          eq(schema.tasks.priority, "high"),
          isNull(schema.tasks.completedAt)
        ));
      const highPriorityCount = highPriorityQuery[0]?.count || 0;
      
      const followUpTrend = {
        value: `${highPriorityCount}`,
        direction: "neutral",
        label: "high priority"
      };

      // Compliance score - calculate from metrics
      const complianceMetricsQuery = await db.select({
        totalScore: sql<number>`sum(score)`,
        totalTarget: sql<number>`sum(target_score)`
      })
      .from(schema.complianceMetrics);
      
      const metrics = complianceMetricsQuery[0];
      const complianceScore = metrics && metrics.totalTarget > 0
        ? Math.round((metrics.totalScore / metrics.totalTarget) * 100)
        : 0;
      
      const complianceTrend = {
        value: "All audit logs complete",
        direction: "up",
        label: ""
      };

      return {
        activeClients: {
          value: activeClientsCount,
          trend: clientTrend
        },
        pendingTasks: {
          value: pendingTasksCount,
          trend: taskTrend
        },
        followUpsToday: {
          value: followUpsCount,
          trend: followUpTrend
        },
        complianceScore: {
          value: `${complianceScore}%`,
          trend: complianceTrend
        }
      };
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      throw error;
    }
  }
}

export class ClientStorage {
  /**
   * Get clients with pagination and search
   */
  static async getClients(page: number, pageSize: number, query?: string) {
    try {
      const offset = (page - 1) * pageSize;
      
      // Base query
      let dbQuery = db.select({
        id: schema.clients.id,
        name: schema.clients.name,
        industry: schema.clients.industry,
        contactName: schema.clients.contactName,
        contactEmail: schema.clients.contactEmail,
        contactPhone: schema.clients.contactPhone,
        address: schema.clients.address,
        notes: schema.clients.notes,
        createdAt: schema.clients.createdAt,
        updatedAt: schema.clients.updatedAt,
      })
      .from(schema.clients)
      .orderBy(desc(schema.clients.updatedAt));
      
      // Apply search if query provided
      if (query) {
        dbQuery = dbQuery.where(
          or(
            like(schema.clients.name, `%${query}%`),
            like(schema.clients.contactName, `%${query}%`),
            like(schema.clients.contactEmail, `%${query}%`),
            like(schema.clients.industry, `%${query}%`)
          )
        );
      }
      
      // Count total (for pagination)
      const countQuery = db.select({ count: sql<number>`count(*)` })
        .from(schema.clients);
      
      // Apply same search filter to count query
      if (query) {
        countQuery.where(
          or(
            like(schema.clients.name, `%${query}%`),
            like(schema.clients.contactName, `%${query}%`),
            like(schema.clients.contactEmail, `%${query}%`),
            like(schema.clients.industry, `%${query}%`)
          )
        );
      }
      
      const countResult = await countQuery;
      const total = countResult[0]?.count || 0;
      
      // Paginate results
      dbQuery = dbQuery.limit(pageSize).offset(offset);
      
      // Execute query
      const clients = await dbQuery;
      
      // Enhance data with additional info
      const enhancedClients = await Promise.all(clients.map(async (client) => {
        // Get pending tasks count
        const pendingTasksQuery = await db.select({ count: sql<number>`count(*)` })
          .from(schema.tasks)
          .where(and(
            eq(schema.tasks.clientId, client.id),
            or(
              eq(schema.tasks.status, "pending"),
              eq(schema.tasks.status, "in progress")
            )
          ));
        
        // Get last activity timestamp
        const lastActivityQuery = await db.select({
          timestamp: schema.activities.timestamp
        })
        .from(schema.activities)
        .where(eq(schema.activities.clientId, client.id))
        .orderBy(desc(schema.activities.timestamp))
        .limit(1);
        
        // Get first two letters of client name for avatar
        const words = client.name.split(' ');
        const initials = words.length > 1 
          ? (words[0][0] + words[1][0]).toUpperCase()
          : client.name.substring(0, 2).toUpperCase();
        
        return {
          ...client,
          initials,
          pendingTasks: pendingTasksQuery[0]?.count || 0,
          lastActivity: lastActivityQuery[0]?.timestamp || null
        };
      }));
      
      return {
        clients: enhancedClients,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error("Error getting clients:", error);
      throw error;
    }
  }

  /**
   * Get client by ID
   */
  static async getClientById(id: number) {
    try {
      const client = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
      
      if (client.length === 0) {
        return null;
      }
      
      // Get pending tasks count
      const pendingTasksQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(and(
          eq(schema.tasks.clientId, id),
          or(
            eq(schema.tasks.status, "pending"),
            eq(schema.tasks.status, "in progress")
          )
        ));
      
      // Get total tasks count
      const totalTasksQuery = await db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .where(eq(schema.tasks.clientId, id));
      
      // Get recent activities
      const activities = await db.select()
        .from(schema.activities)
        .where(eq(schema.activities.clientId, id))
        .orderBy(desc(schema.activities.timestamp))
        .limit(5);
      
      // Get first two letters of client name for avatar
      const words = client[0].name.split(' ');
      const initials = words.length > 1 
        ? (words[0][0] + words[1][0]).toUpperCase()
        : client[0].name.substring(0, 2).toUpperCase();
      
      return {
        ...client[0],
        initials,
        pendingTasks: pendingTasksQuery[0]?.count || 0,
        totalTasks: totalTasksQuery[0]?.count || 0,
        recentActivities: activities
      };
    } catch (error) {
      console.error(`Error getting client with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create client
   */
  static async createClient(clientData: schema.InsertClient) {
    try {
      // Validate client data
      schema.insertClientSchema.parse(clientData);
      
      // Insert client
      const [client] = await db.insert(schema.clients)
        .values(clientData)
        .returning();
      
      return client;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.message}`);
      }
      console.error("Error creating client:", error);
      throw error;
    }
  }

  /**
   * Update client
   */
  static async updateClient(id: number, clientData: Partial<schema.InsertClient>) {
    try {
      // Check if client exists
      const existingClient = await ClientStorage.getClientById(id);
      if (!existingClient) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      // Update client
      const [updatedClient] = await db.update(schema.clients)
        .set({ ...clientData, updatedAt: new Date() })
        .where(eq(schema.clients.id, id))
        .returning();
      
      return updatedClient;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete client
   */
  static async deleteClient(id: number) {
    try {
      // Check if client exists
      const existingClient = await ClientStorage.getClientById(id);
      if (!existingClient) {
        throw new Error(`Client with ID ${id} not found`);
      }
      
      // TODO: In a real application, check for related data and handle cascading deletes or prevent deletion
      
      // Delete client
      const [deletedClient] = await db.delete(schema.clients)
        .where(eq(schema.clients.id, id))
        .returning();
      
      return deletedClient;
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get simple client list for dropdowns
   */
  static async getClientsList() {
    try {
      const clients = await db.select({
        id: schema.clients.id,
        name: schema.clients.name,
        industry: schema.clients.industry
      })
      .from(schema.clients)
      .orderBy(asc(schema.clients.name));
      
      return clients;
    } catch (error) {
      console.error("Error getting clients list:", error);
      throw error;
    }
  }
}

export class TaskStorage {
  /**
   * Get tasks with pagination, search and filters
   */
  static async getTasks(page: number, pageSize: number, filters?: {
    query?: string;
    priority?: string;
    status?: string;
    clientId?: number;
  }) {
    try {
      const offset = (page - 1) * pageSize;
      
      // Join with clients to get client info
      let dbQuery = db.select({
        id: schema.tasks.id,
        description: schema.tasks.description,
        dueDate: schema.tasks.dueDate,
        priority: schema.tasks.priority,
        status: schema.tasks.status,
        notes: schema.tasks.notes,
        createdAt: schema.tasks.createdAt,
        updatedAt: schema.tasks.updatedAt,
        completedAt: schema.tasks.completedAt,
        clientId: schema.clients.id,
        clientName: schema.clients.name,
        clientIndustry: schema.clients.industry,
      })
      .from(schema.tasks)
      .innerJoin(schema.clients, eq(schema.tasks.clientId, schema.clients.id))
      .orderBy(asc(schema.tasks.dueDate));
      
      // Apply filters
      const conditions = [];
      
      if (filters?.query) {
        conditions.push(
          or(
            like(schema.tasks.description, `%${filters.query}%`),
            like(schema.clients.name, `%${filters.query}%`)
          )
        );
      }
      
      if (filters?.priority && filters.priority !== 'all') {
        conditions.push(eq(schema.tasks.priority, filters.priority));
      }
      
      if (filters?.status && filters.status !== 'all') {
        conditions.push(eq(schema.tasks.status, filters.status));
      }
      
      if (filters?.clientId) {
        conditions.push(eq(schema.tasks.clientId, filters.clientId));
      }
      
      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }
      
      // Count total (for pagination)
      let countQuery = db.select({ count: sql<number>`count(*)` })
        .from(schema.tasks)
        .innerJoin(schema.clients, eq(schema.tasks.clientId, schema.clients.id));
      
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      
      const countResult = await countQuery;
      const total = countResult[0]?.count || 0;
      
      // Paginate results
      dbQuery = dbQuery.limit(pageSize).offset(offset);
      
      // Execute query
      const tasks = await dbQuery;
      
      // Format tasks for frontend
      const formattedTasks = tasks.map(task => {
        // Get first two letters of client name for avatar
        const words = task.clientName.split(' ');
        const initials = words.length > 1 
          ? (words[0][0] + words[1][0]).toUpperCase()
          : task.clientName.substring(0, 2).toUpperCase();
        
        return {
          id: task.id,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          notes: task.notes,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,
          client: {
            id: task.clientId,
            name: task.clientName,
            industry: task.clientIndustry,
            initials
          }
        };
      });
      
      return {
        tasks: formattedTasks,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error("Error getting tasks:", error);
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(id: number) {
    try {
      const task = await db.select({
        id: schema.tasks.id,
        description: schema.tasks.description,
        dueDate: schema.tasks.dueDate,
        priority: schema.tasks.priority,
        status: schema.tasks.status,
        notes: schema.tasks.notes,
        createdAt: schema.tasks.createdAt,
        updatedAt: schema.tasks.updatedAt,
        completedAt: schema.tasks.completedAt,
        clientId: schema.clients.id,
        clientName: schema.clients.name,
        clientIndustry: schema.clients.industry,
      })
      .from(schema.tasks)
      .innerJoin(schema.clients, eq(schema.tasks.clientId, schema.clients.id))
      .where(eq(schema.tasks.id, id))
      .limit(1);
      
      if (task.length === 0) {
        return null;
      }
      
      // Format task for frontend
      const words = task[0].clientName.split(' ');
      const initials = words.length > 1 
        ? (words[0][0] + words[1][0]).toUpperCase()
        : task[0].clientName.substring(0, 2).toUpperCase();
      
      return {
        id: task[0].id,
        description: task[0].description,
        dueDate: task[0].dueDate,
        priority: task[0].priority,
        status: task[0].status,
        notes: task[0].notes,
        createdAt: task[0].createdAt,
        updatedAt: task[0].updatedAt,
        completedAt: task[0].completedAt,
        client: {
          id: task[0].clientId,
          name: task[0].clientName,
          industry: task[0].clientIndustry,
          initials
        }
      };
    } catch (error) {
      console.error(`Error getting task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create task
   */
  static async createTask(taskData: any, userId: number) {
    try {
      // Prepare task data
      const taskInsertData = {
        clientId: taskData.clientId,
        assignedToId: userId,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate),
        priority: taskData.priority,
        status: taskData.status,
        notes: taskData.notes
      };
      
      // Insert task
      const [task] = await db.insert(schema.tasks)
        .values(taskInsertData)
        .returning();
      
      return task;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  /**
   * Update task
   */
  static async updateTask(id: number, taskData: any) {
    try {
      // Check if task exists
      const existingTask = await TaskStorage.getTaskById(id);
      if (!existingTask) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      // Prepare update data
      const updateData: any = { ...taskData, updatedAt: new Date() };
      
      // Update dueDate if provided
      if (taskData.dueDate) {
        updateData.dueDate = new Date(taskData.dueDate);
      }
      
      // Update task
      const [updatedTask] = await db.update(schema.tasks)
        .set(updateData)
        .where(eq(schema.tasks.id, id))
        .returning();
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Complete task
   */
  static async completeTask(id: number, userId: number) {
    try {
      // Check if task exists
      const existingTask = await TaskStorage.getTaskById(id);
      if (!existingTask) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      // Update task to completed
      const [completedTask] = await db.update(schema.tasks)
        .set({
          status: "completed",
          completedAt: new Date(),
          completedById: userId,
          updatedAt: new Date()
        })
        .where(eq(schema.tasks.id, id))
        .returning();
      
      return completedTask;
    } catch (error) {
      console.error(`Error completing task with ID ${id}:`, error);
      throw error;
    }
  }
}

export class ActivityStorage {
  /**
   * Get client activities with optional limit
   */
  static async getActivities(limit?: number) {
    try {
      let query = db.select({
        id: schema.activities.id,
        clientId: schema.activities.clientId,
        clientName: schema.clients.name,
        type: schema.activities.type,
        message: schema.activities.message,
        timestamp: schema.activities.timestamp,
        metadata: schema.activities.metadata,
        userId: schema.activities.userId,
        userName: schema.users.fullName,
      })
      .from(schema.activities)
      .innerJoin(schema.clients, eq(schema.activities.clientId, schema.clients.id))
      .innerJoin(schema.users, eq(schema.activities.userId, schema.users.id))
      .orderBy(desc(schema.activities.timestamp));
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const activities = await query;
      
      return activities;
    } catch (error) {
      console.error("Error getting activities:", error);
      throw error;
    }
  }

  /**
   * Add activity
   */
  static async addActivity(activityData: {
    clientId: number;
    userId: number;
    type: string;
    message: string;
    metadata?: any;
  }) {
    try {
      const [activity] = await db.insert(schema.activities)
        .values(activityData)
        .returning();
      
      return activity;
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  }
}

export class AuditLogStorage {
  /**
   * Get audit logs with pagination and search
   */
  static async getAuditLogs(page: number, pageSize: number, query?: string) {
    try {
      const offset = (page - 1) * pageSize;
      
      // Base query with joins
      let dbQuery = db.select({
        id: schema.auditLogs.id,
        action: schema.auditLogs.action,
        resourceType: schema.auditLogs.resourceType,
        resourceId: schema.auditLogs.resourceId,
        details: schema.auditLogs.details,
        timestamp: schema.auditLogs.timestamp,
        userId: schema.users.id,
        userName: schema.users.fullName,
        userAvatar: schema.users.avatar,
        clientId: schema.clients.id,
        clientName: schema.clients.name,
      })
      .from(schema.auditLogs)
      .innerJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
      .leftJoin(schema.clients, eq(schema.auditLogs.clientId, schema.clients.id))
      .orderBy(desc(schema.auditLogs.timestamp));
      
      // Apply search if query provided
      if (query) {
        dbQuery = dbQuery.where(
          or(
            like(schema.auditLogs.details, `%${query}%`),
            like(schema.auditLogs.action, `%${query}%`),
            like(schema.users.fullName, `%${query}%`),
            like(schema.clients.name, `%${query}%`)
          )
        );
      }
      
      // Count total (for pagination)
      let countQuery = db.select({ count: sql<number>`count(*)` })
        .from(schema.auditLogs);
      
      // Apply same search filter to count query
      if (query) {
        countQuery = countQuery
          .innerJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
          .leftJoin(schema.clients, eq(schema.auditLogs.clientId, schema.clients.id))
          .where(
            or(
              like(schema.auditLogs.details, `%${query}%`),
              like(schema.auditLogs.action, `%${query}%`),
              like(schema.users.fullName, `%${query}%`),
              like(schema.clients.name, `%${query}%`)
            )
          );
      }
      
      const countResult = await countQuery;
      const total = countResult[0]?.count || 0;
      
      // Paginate results
      dbQuery = dbQuery.limit(pageSize).offset(offset);
      
      // Execute query
      const logs = await dbQuery;
      
      // Format logs for frontend
      const formattedLogs = logs.map(log => {
        // Get user initials for avatar fallback
        const words = log.userName.split(' ');
        const initials = words.length > 1 
          ? (words[0][0] + words[1][0]).toUpperCase()
          : log.userName.substring(0, 2).toUpperCase();
        
        return {
          id: log.id,
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          details: log.details,
          timestamp: log.timestamp,
          user: {
            id: log.userId,
            name: log.userName,
            avatar: log.userAvatar,
            initials
          },
          client: log.clientId ? {
            id: log.clientId,
            name: log.clientName
          } : null
        };
      });
      
      return {
        logs: formattedLogs,
        total,
        page,
        pageSize
      };
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  }

  /**
   * Add audit log
   */
  static async addAuditLog(logData: {
    userId: number;
    clientId?: number;
    action: string;
    resourceType: string;
    resourceId?: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      const [log] = await db.insert(schema.auditLogs)
        .values(logData)
        .returning();
      
      return log;
    } catch (error) {
      console.error("Error adding audit log:", error);
      throw error;
    }
  }
}

export class SettingsStorage {
  /**
   * Get settings
   */
  static async getSettings() {
    try {
      const allSettings = await db.select().from(schema.settings);
      
      // Group settings by category
      const categorized: Record<string, Record<string, any>> = {};
      
      allSettings.forEach(setting => {
        if (!categorized[setting.category]) {
          categorized[setting.category] = {};
        }
        categorized[setting.category][setting.key] = setting.value;
      });
      
      return categorized;
    } catch (error) {
      console.error("Error getting settings:", error);
      throw error;
    }
  }

  /**
   * Update settings by category
   */
  static async updateSettings(
    category: string,
    settings: Record<string, any>,
    userId: number
  ) {
    try {
      const results = [];
      
      // Update each setting in the category
      for (const [key, value] of Object.entries(settings)) {
        // Check if setting exists
        const existingSetting = await db.select()
          .from(schema.settings)
          .where(and(
            eq(schema.settings.category, category),
            eq(schema.settings.key, key)
          ))
          .limit(1);
        
        if (existingSetting.length > 0) {
          // Update existing setting
          const [updated] = await db.update(schema.settings)
            .set({
              value,
              updatedAt: new Date(),
              updatedById: userId
            })
            .where(and(
              eq(schema.settings.category, category),
              eq(schema.settings.key, key)
            ))
            .returning();
          
          results.push(updated);
        } else {
          // Insert new setting
          const [inserted] = await db.insert(schema.settings)
            .values({
              category,
              key,
              value,
              updatedById: userId
            })
            .returning();
          
          results.push(inserted);
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Error updating settings for category ${category}:`, error);
      throw error;
    }
  }
}

export class ComplianceStorage {
  /**
   * Get compliance metrics
   */
  static async getComplianceMetrics() {
    try {
      const metrics = await db.select().from(schema.complianceMetrics);
      
      // Calculate percentages
      const formattedMetrics = metrics.map(metric => ({
        name: metric.name,
        percentage: Math.round((metric.score / metric.targetScore) * 100),
        status: this.getStatusFromPercentage(Math.round((metric.score / metric.targetScore) * 100))
      }));
      
      // Check if any compliance issues need attention
      const complianceIssues = formattedMetrics.filter(m => m.percentage < 80);
      
      let alert = null;
      if (complianceIssues.length > 0) {
        alert = {
          title: "Compliance Alert",
          message: `${complianceIssues.length} areas need attention. ${complianceIssues[0].name} has the lowest score.`
        };
      }
      
      return {
        compliance: formattedMetrics,
        alert
      };
    } catch (error) {
      console.error("Error getting compliance metrics:", error);
      throw error;
    }
  }
  
  /**
   * Helper to determine status from percentage
   */
  private static getStatusFromPercentage(percentage: number): string {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "warning";
    if (percentage >= 60) return "error";
    return "error";
  }
}

export class ReportStorage {
  /**
   * Get report data
   */
  static async getReportData(type: string, timeRange: string) {
    try {
      switch (type) {
        case "client-activity":
          return await this.getClientActivityReport(timeRange);
        case "task-completion":
          return await this.getTaskCompletionReport(timeRange);
        case "client-distribution":
          return await this.getClientDistributionReport();
        case "compliance-score":
          return await this.getComplianceScoreReport();
        default:
          throw new Error(`Report type '${type}' not supported`);
      }
    } catch (error) {
      console.error(`Error getting report data for type ${type}:`, error);
      throw error;
    }
  }
  
  /**
   * Client activity report
   */
  private static async getClientActivityReport(timeRange: string) {
    const { startDate, endDate, intervalFormat } = this.getDateRangeParams(timeRange);
    
    // Group activities by day and count
    const activities = await db.select({
      day: sql<string>`to_char(${schema.activities.timestamp}, '${intervalFormat}')`,
      count: sql<number>`count(*)`
    })
    .from(schema.activities)
    .where(and(
      gte(schema.activities.timestamp, startDate),
      lte(schema.activities.timestamp, endDate)
    ))
    .groupBy(sql`to_char(${schema.activities.timestamp}, '${intervalFormat}')`)
    .orderBy(sql`to_char(${schema.activities.timestamp}, '${intervalFormat}')` as any);
    
    // Format for charts
    const data = activities.map(activity => ({
      name: activity.day,
      value: Number(activity.count)
    }));
    
    return { data };
  }
  
  /**
   * Task completion report
   */
  private static async getTaskCompletionReport(timeRange: string) {
    const { startDate, endDate, intervalFormat } = this.getDateRangeParams(timeRange);
    
    // Group completed tasks by day and count
    const tasks = await db.select({
      day: sql<string>`to_char(${schema.tasks.completedAt}, '${intervalFormat}')`,
      count: sql<number>`count(*)`
    })
    .from(schema.tasks)
    .where(and(
      isNotNull(schema.tasks.completedAt),
      gte(schema.tasks.completedAt, startDate),
      lte(schema.tasks.completedAt, endDate)
    ))
    .groupBy(sql`to_char(${schema.tasks.completedAt}, '${intervalFormat}')`)
    .orderBy(sql`to_char(${schema.tasks.completedAt}, '${intervalFormat}')` as any);
    
    // Get completion rate
    const totalTasksQuery = await db.select({ count: sql<number>`count(*)` })
      .from(schema.tasks)
      .where(and(
        gte(schema.tasks.createdAt, startDate),
        lte(schema.tasks.createdAt, endDate)
      ));
    
    const completedTasksQuery = await db.select({ count: sql<number>`count(*)` })
      .from(schema.tasks)
      .where(and(
        isNotNull(schema.tasks.completedAt),
        gte(schema.tasks.completedAt, startDate),
        lte(schema.tasks.completedAt, endDate)
      ));
    
    const totalTasks = totalTasksQuery[0]?.count || 0;
    const completedTasks = completedTasksQuery[0]?.count || 0;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    
    // Format for charts
    const data = tasks.map(task => ({
      name: task.day,
      value: Number(task.count)
    }));
    
    return {
      data,
      metadata: {
        completionRate
      }
    };
  }
  
  /**
   * Client distribution by industry report
   */
  private static async getClientDistributionReport() {
    // Group clients by industry and count
    const industries = await db.select({
      industry: schema.clients.industry,
      count: sql<number>`count(*)`
    })
    .from(schema.clients)
    .groupBy(schema.clients.industry)
    .orderBy(desc(sql<number>`count(*)`));
    
    // Format for charts
    const data = industries.map(industry => ({
      name: industry.industry,
      value: Number(industry.count)
    }));
    
    return { data };
  }
  
  /**
   * Compliance score report
   */
  private static async getComplianceScoreReport() {
    // Get compliance metrics
    const metrics = await db.select().from(schema.complianceMetrics);
    
    // Format for charts
    const data = metrics.map(metric => ({
      name: metric.name,
      value: Math.round((metric.score / metric.targetScore) * 100)
    }));
    
    return { data };
  }
  
  /**
   * Helper to get date range parameters based on timeRange
   */
  private static getDateRangeParams(timeRange: string): {
    startDate: Date;
    endDate: Date;
    intervalFormat: string;
  } {
    const endDate = new Date();
    let startDate = new Date();
    let intervalFormat = 'YYYY-MM-DD'; // Default format for day intervals
    
    switch (timeRange) {
      case 'last7':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last30':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last90':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'thisYear':
        startDate = new Date(startDate.getFullYear(), 0, 1); // January 1st of current year
        intervalFormat = 'YYYY-MM'; // Month format for longer periods
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
    }
    
    return { startDate, endDate, intervalFormat };
  }
}

export class UserStorage {
  /**
   * Get user by ID
   */
  static async getUserById(id: number) {
    try {
      const user = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      
      if (user.length === 0) {
        return null;
      }
      
      return user[0];
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get user by username
   */
  static async getUserByUsername(username: string) {
    try {
      const user = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      
      if (user.length === 0) {
        return null;
      }
      
      return user[0];
    } catch (error) {
      console.error(`Error getting user with username ${username}:`, error);
      throw error;
    }
  }
}
