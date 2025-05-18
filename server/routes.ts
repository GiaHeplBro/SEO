import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import {
  ClientStorage,
  TaskStorage,
  ActivityStorage,
  AuditLogStorage,
  SettingsStorage,
  ComplianceStorage,
  ReportStorage,
  DashboardMetrics,
  UserStorage
} from "./storage";
import * as schema from "@shared/schema";
import { z } from "zod";
import { registerSEORoutes } from "./seo-routes";

// Use z.ZodError instead of ZodError
type ZodError = z.ZodError;

// Mock user for demo purposes - in a real app this would use authentication
const DEMO_USER = {
  id: 1,
  username: "alex.morgan",
  fullName: "Alex Morgan",
  role: "manager"
};

// Helper to handle async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Log audit events
const logAuditEvent = async (
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string | undefined,
  details: string,
  clientId?: number
) => {
  try {
    await AuditLogStorage.addAuditLog({
      userId: DEMO_USER.id,
      clientId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Register SEO routes
  registerSEORoutes(app);

  // Authentication - get current user (simplified for demo)
  app.get("/api/auth/me", (req, res) => {
    res.json(DEMO_USER);
  });

  // Dashboard metrics
  app.get("/api/metrics", asyncHandler(async (req, res) => {
    const metrics = await DashboardMetrics.getMetrics();
    res.json(metrics);
  }));

  // ==================== CLIENT ROUTES ====================
  
  // Get clients list with pagination and search
  app.get("/api/clients", asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const query = req.query.query as string | undefined;
    
    const result = await ClientStorage.getClients(page, pageSize, query);
    res.json(result);

    await logAuditEvent(
      req, 
      "viewed", 
      "client", 
      undefined, 
      `Viewed client list${query ? ` with search: "${query}"` : ""}`
    );
  }));

  // Get simplified clients list for dropdowns
  app.get("/api/clients/list", asyncHandler(async (req, res) => {
    const clients = await ClientStorage.getClientsList();
    res.json({ clients });
  }));

  // Get client by ID
  app.get("/api/clients/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await ClientStorage.getClientById(id);
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    res.json(client);

    await logAuditEvent(
      req, 
      "viewed", 
      "client", 
      id.toString(), 
      `Viewed client: ${client.name}`,
      id
    );
  }));

  // Create client
  app.post("/api/clients", asyncHandler(async (req, res) => {
    try {
      const clientData = schema.insertClientSchema.parse(req.body);
      const client = await ClientStorage.createClient(clientData);
      
      res.status(201).json(client);
      
      await logAuditEvent(
        req, 
        "created", 
        "client", 
        client.id.toString(), 
        `Created client: ${client.name}`,
        client.id
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      throw error;
    }
  }));

  // Update client
  app.patch("/api/clients/:id", asyncHandler(async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = req.body;
      
      const client = await ClientStorage.updateClient(id, clientData);
      res.json(client);
      
      await logAuditEvent(
        req, 
        "updated", 
        "client", 
        id.toString(), 
        `Updated client: ${client.name}`,
        id
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }));

  // Delete client
  app.delete("/api/clients/:id", asyncHandler(async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await ClientStorage.deleteClient(id);
      
      res.json({ success: true, message: "Client deleted successfully" });
      
      await logAuditEvent(
        req, 
        "deleted", 
        "client", 
        id.toString(), 
        `Deleted client: ${client.name}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }));

  // ==================== TASK ROUTES ====================
  
  // Get tasks with pagination, search and filters
  app.get("/api/tasks", asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const filters: any = {};
    if (req.query.query) filters.query = req.query.query as string;
    if (req.query.priority && req.query.priority !== 'all') filters.priority = req.query.priority as string;
    if (req.query.status && req.query.status !== 'all') filters.status = req.query.status as string;
    if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
    
    const result = await TaskStorage.getTasks(page, pageSize, filters);
    res.json(result);

    await logAuditEvent(
      req, 
      "viewed", 
      "task", 
      undefined, 
      `Viewed task list with filters`
    );
  }));

  // Get task by ID
  app.get("/api/tasks/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await TaskStorage.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);

    await logAuditEvent(
      req, 
      "viewed", 
      "task", 
      id.toString(), 
      `Viewed task: ${task.description}`,
      task.client.id
    );
  }));

  // Create task
  app.post("/api/tasks", asyncHandler(async (req, res) => {
    try {
      const taskData = req.body;
      const task = await TaskStorage.createTask(taskData, DEMO_USER.id);
      
      // Add client activity for the task
      await ActivityStorage.addActivity({
        clientId: task.clientId,
        userId: DEMO_USER.id,
        type: "meeting-scheduled",
        message: `<span class="font-medium">You</span> scheduled a task: ${task.description}`,
      });
      
      res.status(201).json(task);
      
      await logAuditEvent(
        req, 
        "created", 
        "task", 
        task.id.toString(), 
        `Created task: ${task.description}`,
        task.clientId
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      throw error;
    }
  }));

  // Update task
  app.patch("/api/tasks/:id", asyncHandler(async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = req.body;
      
      const task = await TaskStorage.updateTask(id, taskData);
      res.json(task);
      
      await logAuditEvent(
        req, 
        "updated", 
        "task", 
        id.toString(), 
        `Updated task: ${task.description}`,
        task.clientId
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.format() });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }));

  // Complete task
  app.patch("/api/tasks/:id/complete", asyncHandler(async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await TaskStorage.completeTask(id, DEMO_USER.id);
      
      // Add client activity for the completion
      await ActivityStorage.addActivity({
        clientId: task.clientId,
        userId: DEMO_USER.id,
        type: "approval",
        message: `<span class="font-medium">Task completed</span>: ${task.description}`,
      });
      
      res.json(task);
      
      await logAuditEvent(
        req, 
        "modified", 
        "task", 
        id.toString(), 
        `Completed task: ${task.description}`,
        task.clientId
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  }));

  // ==================== ACTIVITY ROUTES ====================
  
  // Get client activities
  app.get("/api/activities", asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const activities = await ActivityStorage.getActivities(limit);
    res.json(activities);
  }));

  // ==================== AUDIT LOG ROUTES ====================
  
  // Get audit logs with pagination and search
  app.get("/api/audit-logs", asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const query = req.query.query as string | undefined;
    
    const result = await AuditLogStorage.getAuditLogs(page, pageSize, query);
    res.json(result);

    // We don't log viewing audit logs to avoid recursion
  }));

  // Export audit logs as CSV
  app.get("/api/audit-logs/export", asyncHandler(async (req, res) => {
    const logs = await AuditLogStorage.getAuditLogs(1, 1000);
    
    // Create CSV content
    let csvContent = "ID,Action,Resource Type,Resource ID,Details,User,Client,Timestamp\n";
    logs.logs.forEach(log => {
      csvContent += `${log.id},${log.action},"${log.resourceType}",${log.resourceId || ''},"${log.details.replace(/"/g, '""')}","${log.user.name}","${log.client?.name || ''}","${log.timestamp}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csvContent);
    
    await logAuditEvent(
      req, 
      "exported", 
      "audit_log", 
      undefined, 
      `Exported audit logs to CSV`
    );
  }));

  // ==================== SETTINGS ROUTES ====================
  
  // Get settings
  app.get("/api/settings", asyncHandler(async (req, res) => {
    const settings = await SettingsStorage.getSettings();
    
    // If no settings exist yet, return defaults
    if (!settings.general) {
      settings.general = {
        companyName: "Your Company",
        emailAddress: "contact@example.com",
        notificationPreferences: {
          email: true,
          inApp: true
        },
        defaultTaskReminder: "1day"
      };
    }
    
    if (!settings.audit) {
      settings.audit = {
        retentionPeriod: "90days",
        logTaskCompletions: true,
        logClientInteractions: true,
        logDataExports: true,
        enableDetailedLogs: true
      };
    }
    
    res.json(settings);
  }));

  // Update general settings
  app.patch("/api/settings/general", asyncHandler(async (req, res) => {
    const settings = req.body;
    const result = await SettingsStorage.updateSettings("general", settings, DEMO_USER.id);
    res.json({ success: true, message: "Settings updated successfully" });
    
    await logAuditEvent(
      req, 
      "updated", 
      "settings", 
      "general", 
      `Updated general settings`
    );
  }));

  // Update audit settings
  app.patch("/api/settings/audit", asyncHandler(async (req, res) => {
    const settings = req.body;
    const result = await SettingsStorage.updateSettings("audit", settings, DEMO_USER.id);
    res.json({ success: true, message: "Settings updated successfully" });
    
    await logAuditEvent(
      req, 
      "updated", 
      "settings", 
      "audit", 
      `Updated audit and compliance settings`
    );
  }));

  // ==================== COMPLIANCE ROUTES ====================
  
  // Get compliance status
  app.get("/api/compliance", asyncHandler(async (req, res) => {
    const compliance = await ComplianceStorage.getComplianceMetrics();
    res.json(compliance);
  }));

  // ==================== REPORT ROUTES ====================
  
  // Get report data
  app.get("/api/reports", asyncHandler(async (req, res) => {
    const type = req.query.type as string;
    const timeRange = req.query.timeRange as string;
    
    if (!type || !timeRange) {
      return res.status(400).json({ message: "Missing required parameters: type and timeRange" });
    }
    
    const report = await ReportStorage.getReportData(type, timeRange);
    res.json(report);
    
    await logAuditEvent(
      req, 
      "viewed", 
      "report", 
      type, 
      `Viewed ${type} report with time range: ${timeRange}`
    );
  }));

  // Export report as CSV
  app.get("/api/reports/export", asyncHandler(async (req, res) => {
    const type = req.query.type as string;
    const timeRange = req.query.timeRange as string;
    
    if (!type || !timeRange) {
      return res.status(400).json({ message: "Missing required parameters: type and timeRange" });
    }
    
    const report = await ReportStorage.getReportData(type, timeRange);
    
    // Create CSV content
    let csvContent = "Name,Value\n";
    report.data.forEach((item: any) => {
      csvContent += `"${item.name}",${item.value}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
    res.send(csvContent);
    
    await logAuditEvent(
      req, 
      "exported", 
      "report", 
      type, 
      `Exported ${type} report to CSV`
    );
  }));

  return httpServer;
}
