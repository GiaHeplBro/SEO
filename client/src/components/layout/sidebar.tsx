import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Search,
  FileSearch,
  Code,
  Link2,
  Sparkles,
  Settings,
  Rocket,
} from "lucide-react";

const menuItems = [
  {
    category: "SEO Tools",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
        path: "/",
      },
      {
        name: "Keyword Analysis",
        icon: <Search className="mr-3 h-5 w-5" />,
        path: "/keyword-analysis",
      },
      {
        name: "SEO Audit",
        icon: <FileSearch className="mr-3 h-5 w-5" />,
        path: "/seo-audit",
      },
      {
        name: "Content Optimization",
        icon: <Sparkles className="mr-3 h-5 w-5" />,
        path: "/content-optimization",
      },
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
        className={`bg-white dark:bg-gray-900 w-64 h-full shadow-md ${
          sidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"
        } md:block overflow-y-auto`}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Rocket className="mr-2 h-6 w-6 text-blue-500" />
            SEOBoostAI
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            AI-powered SEO Platform
          </p>
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
                        ? "text-white bg-blue-600 dark:bg-blue-500 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
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

      {/* Mobile menu button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Rocket className="h-6 w-6" />
      </button>
    </>
  );
}
