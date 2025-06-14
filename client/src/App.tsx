import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Import các trang và component
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import KeywordAnalysis from "@/pages/keyword-analysis";
import SeoAudit from "@/pages/seo-audit";
import OnPageOptimization from "@/pages/on-page-optimization";
import BacklinkAnalysis from "@/pages/backlink-analysis";
import ContentOptimization from "@/pages/content-optimization";
import Auth from '@/components/loginGoogle/Auth';
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import UsersPage from '@/pages/UsersPage'; // 1. Import trang mới
import ProfilePage from '@/pages/ProfilePage'; // 1. Import trang mới

// --- Định nghĩa kiểu dữ liệu cho User ---
interface UserProfile {
  fullName?: string;
  email?: string;
  picture?: string; // Thêm trường picture để khớp với Header
}

// --- Component Router đã được sửa ---
// SỬA Ở ĐÂY 1: Định nghĩa Router để nhận cả 'user' và 'onLogout'
function Router({ onLogout, user }: { onLogout: () => void; user: UserProfile }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* SỬA Ở ĐÂY 2: Truyền 'user' và 'onLogout' xuống cho Header */}
        <Header onLogout={onLogout} user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-4">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/keyword-analysis" component={KeywordAnalysis} />
            <Route path="/seo-audit" component={SeoAudit} />
            <Route path="/on-page-optimization" component={OnPageOptimization} />
            <Route path="/backlink-analysis" component={BacklinkAnalysis} />
            <Route path="/content-optimization" component={ContentOptimization} />
            <Route path="/users" component={UsersPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

// --- Component App chính (phần này bạn đã làm đúng) ---
function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {user ? (
        // Lệnh gọi này giờ đã hợp lệ vì Router đã được định nghĩa để nhận 'user'
        <Router onLogout={handleLogout} user={user} />
      ) : (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;