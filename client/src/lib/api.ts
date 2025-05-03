import { apiRequest } from "./queryClient";

// Client API
export const getClients = async (page: number, pageSize: number, query?: string) => {
  return await fetch(`/api/clients?page=${page}&pageSize=${pageSize}${query ? `&query=${query}` : ''}`);
};

export const getClientById = async (id: string) => {
  return await fetch(`/api/clients/${id}`);
};

export const createClient = async (data: any) => {
  return await apiRequest('POST', '/api/clients', data);
};

export const updateClient = async (id: string, data: any) => {
  return await apiRequest('PATCH', `/api/clients/${id}`, data);
};

export const deleteClient = async (id: string) => {
  return await apiRequest('DELETE', `/api/clients/${id}`, null);
};

// Task API
export const getTasks = async (page: number, pageSize: number, filters?: any) => {
  let url = `/api/tasks?page=${page}&pageSize=${pageSize}`;
  
  if (filters) {
    if (filters.query) url += `&query=${filters.query}`;
    if (filters.priority) url += `&priority=${filters.priority}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.clientId) url += `&clientId=${filters.clientId}`;
  }
  
  return await fetch(url);
};

export const getTaskById = async (id: string) => {
  return await fetch(`/api/tasks/${id}`);
};

export const createTask = async (data: any) => {
  return await apiRequest('POST', '/api/tasks', data);
};

export const updateTask = async (id: string, data: any) => {
  return await apiRequest('PATCH', `/api/tasks/${id}`, data);
};

export const completeTask = async (id: string) => {
  return await apiRequest('PATCH', `/api/tasks/${id}/complete`, null);
};

// Activity API
export const getActivities = async (limit?: number) => {
  return await fetch(`/api/activities${limit ? `?limit=${limit}` : ''}`);
};

// Audit Logs API
export const getAuditLogs = async (page: number, pageSize: number, query?: string) => {
  return await fetch(`/api/audit-logs?page=${page}&pageSize=${pageSize}${query ? `&query=${query}` : ''}`);
};

export const exportAuditLogs = async () => {
  return await fetch('/api/audit-logs/export');
};

// Reports API
export const getReport = async (type: string, timeRange: string) => {
  return await fetch(`/api/reports?type=${type}&timeRange=${timeRange}`);
};

export const exportReport = async (type: string, timeRange: string) => {
  return await fetch(`/api/reports/export?type=${type}&timeRange=${timeRange}`);
};

// Settings API
export const getSettings = async () => {
  return await fetch('/api/settings');
};

export const updateGeneralSettings = async (data: any) => {
  return await apiRequest('PATCH', '/api/settings/general', data);
};

export const updateAuditSettings = async (data: any) => {
  return await apiRequest('PATCH', '/api/settings/audit', data);
};

// Dashboard metrics
export const getDashboardMetrics = async () => {
  return await fetch('/api/metrics');
};

// Compliance API
export const getComplianceStatus = async () => {
  return await fetch('/api/compliance');
};
