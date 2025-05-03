import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

const pathToTitle: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/tasks": "Tasks",
  "/reports": "Reports",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

const pathToDescription: Record<string, string> = {
  "/": "Overview of your client relationships and tasks",
  "/clients": "Manage your client information and interactions",
  "/tasks": "Track and manage your follow-up tasks",
  "/reports": "Generate and view reports on your client relationships",
  "/audit-logs": "Review system audit logs for compliance",
  "/settings": "Configure system settings and preferences",
};

export default function Header() {
  const [location] = useLocation();
  const [notificationCount] = useState(3);

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="md:flex md:flex-col md:gap-1 hidden">
          <h2 className="text-2xl font-medium text-neutral-500">
            {pathToTitle[location] || "Not Found"}
          </h2>
          <p className="text-neutral-400">
            {pathToDescription[location] || ""}
          </p>
        </div>
        
        <div className="flex items-center md:hidden">
          <h1 className="text-xl font-medium text-primary">ClientTrack PM</h1>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4 hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-neutral-100 rounded-full pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-sm w-64" 
            />
            <Search className="absolute left-3 top-2.5 text-neutral-400 h-4 w-4" />
          </div>
          
          <div className="relative">
            <button className="relative p-1 text-neutral-400 hover:text-primary focus:outline-none">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center">
                  {notificationCount}
                </Badge>
              )}
            </button>
          </div>
          
          <div className="ml-4 flex items-center">
            <Avatar className="h-8 w-8 border-2 border-primary">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="text-xs text-neutral-400">Project Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
