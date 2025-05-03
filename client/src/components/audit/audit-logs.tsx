import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

// Action badge variants
const actionBadges: Record<string, string> = {
  created: "bg-success bg-opacity-10 text-success",
  updated: "bg-primary bg-opacity-10 text-primary",
  viewed: "bg-info bg-opacity-10 text-info",
  modified: "bg-warning bg-opacity-10 text-warning",
  deleted: "bg-error bg-opacity-10 text-error"
};

export function AuditLogs() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/audit-logs', { page, pageSize, query: debouncedSearchQuery }],
  });
  
  const logs = data?.logs || [];
  const totalLogs = data?.total || 0;
  const pageCount = Math.ceil(totalLogs / pageSize);

  // Effect for debouncing search query
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  });

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/audit-logs/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const columns = [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: (log: any) => (
        <div className="text-sm text-neutral-400">
          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "User",
      cell: (log: any) => (
        <div className="flex items-center">
          <Avatar className="h-6 w-6 rounded-full mr-2">
            <AvatarImage src={log.user.avatar} alt={log.user.name} />
            <AvatarFallback>{log.user.initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-neutral-500">{log.user.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: (log: any) => (
        <div className="text-sm text-neutral-500">
          {log.client?.name || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: (log: any) => (
        <Badge className={`${actionBadges[log.action.toLowerCase()]} capitalize`}>
          {log.action}
        </Badge>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: (log: any) => (
        <div className="text-sm text-neutral-500">
          {log.details}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-neutral-500">Audit Logs</CardTitle>
          <div className="flex items-center">
            <div className="relative mr-2">
              <Input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pr-8 text-sm"
              />
              <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary mr-2"
              onClick={exportLogs}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" className="text-primary">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={logs}
          pageSize={pageSize}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          loading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
