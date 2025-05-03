import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Filter, Search, Edit, CheckCircle } from "lucide-react";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Priority badge variants
const priorityBadges: Record<string, string> = {
  high: "bg-error bg-opacity-10 text-error",
  medium: "bg-warning bg-opacity-10 text-warning",
  normal: "bg-info bg-opacity-10 text-info",
  low: "bg-neutral-300 bg-opacity-10 text-neutral-500"
};

// Status badge variants
const statusBadges: Record<string, string> = {
  pending: "bg-warning bg-opacity-10 text-warning",
  "in progress": "bg-success bg-opacity-10 text-success",
  scheduled: "bg-info bg-opacity-10 text-info",
  completed: "bg-success bg-opacity-10 text-success",
  cancelled: "bg-neutral-300 bg-opacity-10 text-neutral-500"
};

export default function Tasks() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  });
  
  // Fetch tasks
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tasks', { 
      page, 
      pageSize, 
      query: debouncedSearchQuery,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined
    }],
  });
  
  const tasks = data?.tasks || [];
  const totalTasks = data?.total || 0;
  const pageCount = Math.ceil(totalTasks / pageSize);

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}/complete`, null);
      
      toast({
        title: "Task completed",
        description: "The task has been marked as completed.",
      });
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "There was an error updating the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "client",
      header: "Client",
      cell: (task: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">
            <AvatarFallback>{task.client.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-500">{task.client.name}</div>
            <div className="text-xs text-neutral-400">{task.client.industry}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Task",
      cell: (task: any) => (
        <div className="text-sm text-neutral-500">{task.description}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      cell: (task: any) => {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== 'completed';
        return (
          <div className={`text-sm ${isOverdue ? 'text-error' : 'text-neutral-500'} font-medium`}>
            {format(dueDate, 'MMM d, yyyy h:mm a')}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (task: any) => (
        <Badge className={`${priorityBadges[task.priority.toLowerCase()]} capitalize`}>
          {task.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (task: any) => (
        <Badge className={`${statusBadges[task.status.toLowerCase()]} capitalize`}>
          {task.status}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (task: any) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary p-1 h-8 w-8 hover:bg-primary hover:bg-opacity-10 rounded"
            onClick={() => handleEditTask(task)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary p-1 h-8 w-8 hover:bg-primary hover:bg-opacity-10 rounded"
            onClick={() => handleCompleteTask(task.id)}
            disabled={task.status === 'completed'}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="border-b border-neutral-200 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-neutral-500">Tasks</CardTitle>
            <div className="flex items-center">
              <div className="relative mr-2">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pr-8 text-sm w-64"
                />
                <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[110px] mr-2 h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] mr-2 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Task
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={tasks}
            pageSize={pageSize}
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            loading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Task Form Dialog */}
      <TaskFormDialog 
        open={isTaskFormOpen} 
        onOpenChange={setIsTaskFormOpen}
        task={editingTask}
      />
    </>
  );
}
