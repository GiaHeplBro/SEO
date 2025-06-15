import { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Import tất cả các trang
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import KeywordAnalysis from "@/pages/keyword-analysis";
import SeoAudit from "@/pages/seo-audit";
import ContentOptimization from "@/pages/on-page-optimization";
import ProfilePage from '@/pages/ProfilePage';
import PricingPage from '@/pages/PricingPage';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/components/loginGoogle/Auth'; // Component Auth gốc

// Import các layout component
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

// Định nghĩa interface UserProfile
interface UserProfile {
  fullName?: string;
  email?: string;
  picture?: string;
}

// --- Component mới: Layout chính của ứng dụng cho người dùng đã đăng nhập ---
// (Về cơ bản là component "Router" cũ của bạn, được đổi tên cho rõ nghĩa)
function MainAppLayout({ onLogout, user }: { onLogout: () => void; user: UserProfile }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-4">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/keyword-analysis" component={KeywordAnalysis} />
            <Route path="/seo-audit" component={SeoAudit} />
            <Route path="/content-optimization" component={ContentOptimization} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/pricing" component={PricingPage} />
            {/* Nếu người dùng đã đăng nhập mà vào trang gốc, tự động chuyển đến dashboard */}
            <Route path="/"><Redirect to="/dashboard" /></Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}


// --- Component App chính với logic routing mới ---
function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [, navigate] = useLocation();

  // useEffect này chỉ chạy một lần để kiểm tra xem user đã đăng nhập từ trước chưa
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    // Lưu lại user vào localStorage để duy trì đăng nhập
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    // Sau khi đăng nhập thành công, chuyển hướng đến dashboard
    navigate('/dashboard'); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setUser(null);
    // Sau khi đăng xuất, quay về trang landing page
    navigate('/'); 
  };

  return (
    <QueryClientProvider client={queryClient}>
        {/* Dựa vào state `user` để quyết định hiển thị giao diện nào */}
        {user ? (
            // NẾU ĐÃ ĐĂNG NHẬP: Hiển thị giao diện ứng dụng chính
            <MainAppLayout onLogout={handleLogout} user={user} />
        ) : (
            // NẾU CHƯA ĐĂNG NHẬP: Hiển thị các trang public
            <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/login">
                  <Auth onLoginSuccess={handleLoginSuccess} />
                </Route>
                <Route path="/pricing" component={PricingPage} />

                {/* Nếu người dùng chưa đăng nhập mà cố vào một trang khác, đưa về trang chủ */}
                <Route>
                  <Redirect to="/" />
                </Route>
            </Switch>
        )}
        <Toaster />
    </QueryClientProvider>
  );
}

export default App;