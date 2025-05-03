import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Filter, Search, Edit, Trash, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Clients() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  
  // Fetch clients
  const { data, isLoading } = useQuery({
    queryKey: ['/api/clients', { page, pageSize, query: debouncedSearchQuery }],
  });
  
  const clients = data?.clients || [];
  const totalClients = data?.total || 0;
  const pageCount = Math.ceil(totalClients / pageSize);

  // Debounce search query
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  });

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setIsClientFormOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/clients/${clientToDelete.id}`, null);
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
      
      // Invalidate and refetch clients
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Reset client to delete
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Client",
      cell: (client: any) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">
            <AvatarFallback>{client.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-500">{client.name}</div>
            <div className="text-xs text-neutral-400">{client.industry}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: (client: any) => (
        <div>
          <div className="text-sm text-neutral-500">{client.contactName}</div>
          <div className="text-xs text-neutral-400">{client.contactEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "contactPhone",
      header: "Phone",
      cell: (client: any) => (
        <div className="text-sm text-neutral-500">{client.contactPhone}</div>
      ),
    },
    {
      accessorKey: "pendingTasks",
      header: "Tasks",
      cell: (client: any) => (
        <div className="text-sm text-neutral-500">{client.pendingTasks} pending</div>
      ),
    },
    {
      accessorKey: "lastActivity",
      header: "Last Activity",
      cell: (client: any) => (
        <div className="text-sm text-neutral-500">
          {client.lastActivity ? format(new Date(client.lastActivity), 'MMM d, yyyy') : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (client: any) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.location.href = `/clients/${client.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleEditClient(client)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-error"
            onClick={() => setClientToDelete(client)}
          >
            <Trash className="h-4 w-4" />
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
            <CardTitle className="text-lg font-medium text-neutral-500">Clients</CardTitle>
            <div className="flex items-center">
              <div className="relative mr-2">
                <Input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pr-8 text-sm w-64"
                />
                <Search className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary mr-2"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingClient(null);
                  setIsClientFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={clients}
            pageSize={pageSize}
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            loading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Client Form Dialog */}
      <ClientFormDialog 
        open={isClientFormOpen} 
        onOpenChange={setIsClientFormOpen}
        client={editingClient}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client
              {clientToDelete ? ` "${clientToDelete.name}"` : ""} and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-error-foreground hover:bg-error/90"
              onClick={handleDeleteClient}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
