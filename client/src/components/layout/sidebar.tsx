import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BarChart3, 
  ShieldAlert, 
  Settings
} from "lucide-react";

const menuItems = [
  {
    category: "Main",
    items: [
      { name: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, path: "/" },
      { name: "Clients", icon: <Users className="mr-3 h-5 w-5" />, path: "/clients" },
      { name: "Tasks", icon: <CheckSquare className="mr-3 h-5 w-5" />, path: "/tasks" },
      { name: "Reports", icon: <BarChart3 className="mr-3 h-5 w-5" />, path: "/reports" },
    ],
  },
  {
    category: "Settings",
    items: [
      { name: "Audit Logs", icon: <ShieldAlert className="mr-3 h-5 w-5" />, path: "/audit-logs" },
      { name: "Settings", icon: <Settings className="mr-3 h-5 w-5" />, path: "/settings" },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`bg-white w-64 h-full shadow-md ${
          sidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"
        } md:block overflow-y-auto`}
      >
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-medium text-primary flex items-center">
            <Users className="mr-2 h-6 w-6" />
            ClientTrack PM
          </h1>
        </div>
        
        <div className="py-2">
          {menuItems.map((category, idx) => (
            <div key={idx}>
              <p className="px-4 py-2 text-xs uppercase text-muted-foreground font-medium mt-2">
                {category.category}
              </p>
              {category.items.map((item, i) => {
                const isActive = location === item.path;
                return (
                  <Link 
                    key={i} 
                    href={item.path}
                    className={`sidebar-menu-item flex items-center px-4 py-3 ${
                      isActive 
                        ? "text-primary active" 
                        : "text-neutral-400 hover:text-primary"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
      
      {/* Mobile menu button - rendered in the Header component */}
      <button 
        className="md:hidden fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Users className="h-6 w-6" />
      </button>
    </>
  );
}
