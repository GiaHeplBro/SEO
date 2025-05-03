import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListPlus, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

export function QuickActions() {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const handleScheduleMeeting = () => {
    // This could be implemented with a calendar integration
    window.open('/tasks?schedule=meeting', '_self');
  };

  const handleGenerateReport = () => {
    window.open('/reports', '_self');
  };

  return (
    <>
      <Card className="shadow mb-6">
        <CardHeader className="border-b border-neutral-200 p-4">
          <CardTitle className="text-lg font-medium text-neutral-500">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Button 
            className="w-full mb-3 bg-primary text-white hover:bg-primary-dark"
            onClick={() => setIsClientDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Client
          </Button>
          
          <Button 
            className="w-full mb-3 bg-secondary text-white hover:bg-blue-700"
            onClick={() => setIsTaskDialogOpen(true)}
          >
            <ListPlus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full mb-3 text-neutral-500 border-neutral-200 hover:bg-neutral-100"
            onClick={handleScheduleMeeting}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-neutral-500 border-neutral-200 hover:bg-neutral-100"
            onClick={handleGenerateReport}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClientFormDialog 
        open={isClientDialogOpen} 
        onOpenChange={setIsClientDialogOpen} 
      />
      
      <TaskFormDialog 
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />
    </>
  );
}
