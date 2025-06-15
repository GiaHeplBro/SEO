import { useState } from "react";
// SỬA Ở ĐÂY 1: Thêm "User as UserIcon" để tránh trùng tên và "LogOut"
import { Bell, Search, Sparkles, Globe, Zap, User as UserIcon, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter"; // SỬA Ở ĐÂY 2: Thêm "Link" từ wouter
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



// --- Các hằng số và interface giữ nguyên ---
const pathToTitle: Record<string, string> = {
  "/": "Dashboard",
  "/keyword-analysis": "Keyword Analysis",
  "/seo-audit": "SEO Audit",
  "/on-page-optimization": "On-Page Optimization",
  "/content-optimization": "Content Optimization",
  "/profile": "Hồ sơ của tôi",
  "/pricing": "Upgrade Plan", // Thêm dòng này
};

const pathToDescription: Record<string, string> = {
  "/": "Overview of your SEO performance and recent optimizations",
  "/profile": "Xem và chỉnh sửa thông tin cá nhân của bạn",
  "/pricing": "Choose a plan that fits your needs", // Thêm dòng này
};

interface UserProfile {
  fullName?: string;
  email?: string;
  picture?: string;
}

interface HeaderProps {
  onLogout: () => void;
  user: UserProfile;
}

const getAvatarFallback = (name?: string): string => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};


export default function Header({ onLogout, user }: HeaderProps) {
  const [location] = useLocation();
  const [notificationCount] = useState(2);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Phần tiêu đề không đổi */}
        <div className="md:flex md:flex-col md:gap-1 hidden">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            {pathToTitle[location] || "Not Found"}
            {location === '/content-optimization' && <Sparkles className="ml-2 h-5 w-5 text-yellow-500" />}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {pathToDescription[location] || ""}
          </p>
        </div>

        {/* Phần còn lại của header không đổi */}
        <div className="flex items-center md:hidden">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            SEOBoostAI
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pricing">
            <Button size="sm" className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Zap className="h-4 w-4" />
              <span>Upgrade</span>
            </Button>
          </Link>
          
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

          {/* SỬA Ở ĐÂY 3: Cập nhật nội dung của DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-3 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-blue-500">
                  <AvatarImage src={user.picture} alt={user.fullName || "User profile"} />
                  <AvatarFallback>{getAvatarFallback(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-2 hidden md:block text-left">
                  <p className="text-sm font-medium">{user.fullName || "User"}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <Zap className="mr-1 h-3 w-3" />
                    <span>Pro Plan</span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* === PHẦN THÊM VÀO ĐÂY === */}
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
              </Link>
              {/* === KẾT THÚC PHẦN THÊM VÀO === */}

              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}