import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit, CheckCircle, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { TaskFormDialog } from "./task-form-dialog";

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

export function TaskList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tasks', { page, pageSize }],
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
      await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    } catch (error) {
      console.error('Error completing task:', error);
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
            {format(dueDate, 'MMM d, h:mm a')}
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
            <CardTitle className="text-lg font-medium text-neutral-500">Follow-up Tasks</CardTitle>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="text-primary mr-2">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
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
      
      <TaskFormDialog 
        open={isTaskFormOpen} 
        onOpenChange={setIsTaskFormOpen}
        task={editingTask}
      />
    </>
  );
}
