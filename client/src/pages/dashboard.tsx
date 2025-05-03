import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, Calendar, ShieldCheck, ClipboardCheck } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TaskList } from "@/components/tasks/task-list";
import { ClientActivity } from "@/components/dashboard/client-activity";
import { AuditLogs } from "@/components/audit/audit-logs";
import { ComplianceStatus } from "@/components/dashboard/compliance-status";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/metrics'],
  });

  return (
    <div>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Active Clients"
          value={isLoading ? "-" : metrics?.activeClients.value || 0}
          trend={
            !isLoading && metrics?.activeClients.trend
              ? {
                  value: metrics.activeClients.trend.value,
                  direction: metrics.activeClients.trend.direction,
                  label: metrics.activeClients.trend.label,
                }
              : undefined
          }
          icon={<Users className="text-primary h-5 w-5" />}
          iconBgColor="bg-primary"
        />
        
        <MetricCard
          title="Pending Tasks"
          value={isLoading ? "-" : metrics?.pendingTasks.value || 0}
          trend={
            !isLoading && metrics?.pendingTasks.trend
              ? {
                  value: metrics.pendingTasks.trend.value,
                  direction: metrics.pendingTasks.trend.direction,
                  label: metrics.pendingTasks.trend.label,
                }
              : undefined
          }
          icon={<ClipboardCheck className="text-error h-5 w-5" />}
          iconBgColor="bg-error"
        />
        
        <MetricCard
          title="Follow-ups Today"
          value={isLoading ? "-" : metrics?.followUpsToday.value || 0}
          trend={
            !isLoading && metrics?.followUpsToday.trend
              ? {
                  value: metrics.followUpsToday.trend.value,
                  direction: metrics.followUpsToday.trend.direction,
                  label: metrics.followUpsToday.trend.label,
                }
              : undefined
          }
          icon={<Calendar className="text-warning h-5 w-5" />}
          iconBgColor="bg-warning"
        />
        
        <MetricCard
          title="Compliance Score"
          value={isLoading ? "-" : metrics?.complianceScore.value || "0%"}
          trend={
            !isLoading && metrics?.complianceScore.trend
              ? {
                  value: metrics.complianceScore.trend.value,
                  direction: metrics.complianceScore.trend.direction,
                  label: metrics.complianceScore.trend.label,
                }
              : undefined
          }
          icon={<ShieldCheck className="text-success h-5 w-5" />}
          iconBgColor="bg-success"
        />
      </div>
      
      {/* Tasks and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        
        <div className="lg:col-span-1">
          <ClientActivity />
        </div>
      </div>
      
      {/* Audit Logs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AuditLogs />
        </div>
        
        <div className="lg:col-span-1">
          <QuickActions />
          <ComplianceStatus />
        </div>
      </div>
    </div>
  );
}
