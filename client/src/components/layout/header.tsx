import { useState } from "react";
import { Bell, Search, Sparkles, Globe, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const pathToTitle: Record<string, string> = {
  "/": "Dashboard",
  "/keyword-analysis": "Keyword Analysis",
  "/seo-audit": "SEO Audit",
  "/on-page-optimization": "On-Page Optimization",
  "/backlink-analysis": "Backlink Analysis",
  "/content-optimization": "Content Optimization",
  "/settings": "Settings",
};

const pathToDescription: Record<string, string> = {
  "/": "Overview of your SEO performance and recent optimizations",
  "/keyword-analysis": "Research and discover high-performing keywords for your content",
  "/seo-audit": "Comprehensive analysis of your website's SEO health",
  "/on-page-optimization": "Optimize your page elements for better search visibility",
  "/backlink-analysis": "Analyze your backlink profile and discover opportunities",
  "/content-optimization": "AI-powered content enhancement for better rankings",
  "/settings": "Configure system settings and preferences",
};

export default function Header() {
  const [location] = useLocation();
  const [notificationCount] = useState(2);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="md:flex md:flex-col md:gap-1 hidden">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            {pathToTitle[location] || "Not Found"}
            {location === '/content-optimization' && <Sparkles className="ml-2 h-5 w-5 text-yellow-500" />}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {pathToDescription[location] || ""}
          </p>
        </div>
        
        <div className="flex items-center md:hidden">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            SEOBoostAI
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
            <Globe className="h-4 w-4" />
            <span>New Analysis</span>
          </Button>
          
          <div className="relative mr-2 hidden md:block">
            <Input 
              type="text" 
              placeholder="Enter a URL to analyze..." 
              className="bg-gray-50 dark:bg-gray-800 rounded-full pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm w-64" 
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
          </div>
          
          <div className="relative">
            <button className="relative p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-blue-600">
                  {notificationCount}
                </Badge>
              )}
            </button>
          </div>
          
          <div className="ml-3 flex items-center">
            <Avatar className="h-8 w-8 border-2 border-blue-500">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium">Alex Morgan</p>
              <div className="flex items-center text-xs text-blue-600">
                <Zap className="mr-1 h-3 w-3" />
                <span>Pro Plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
