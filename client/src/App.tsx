import { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Import tất cả các trang và component bạn có
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import KeywordAnalysis from "@/pages/keyword-analysis";
import SeoAudit from "@/pages/seo-audit";
import OnPageOptimization from "@/pages/on-page-optimization";
import BacklinkAnalysis from "@/pages/backlink-analysis";
import ContentOptimization from "@/pages/content-optimization";
import ProfilePage from '@/pages/ProfilePage';
import PricingPage from '@/pages/PricingPage';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/components/loginGoogle/Auth';
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FeatureComparisonPage from '@/pages/FeatureComparisonPage';
import AdminPage from '@/pages/AdminPage';
// Bạn có thể xóa dòng UsersPage nếu không dùng đến trang này nữa
import UsersPage from '@/pages/UsersPage'; 

// Định nghĩa interface UserProfile
interface UserProfile {
  fullName?: string;
  email?: string;
  picture?: string;
}

// --- Component Layout chính của ứng dụng cho người dùng đã đăng nhập ---
function MainAppLayout({ onLogout, user }: { onLogout: () => void; user: UserProfile }) {
  const [location] = useLocation();
  const noSidebarRoutes = ['/feature-comparison'];
  const showSidebar = !noSidebarRoutes.includes(location);

  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-4">
          <Switch>
            {/* SỬA Ở ĐÂY: Đảm bảo chứa tất cả các route của bạn */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/keyword-analysis" component={KeywordAnalysis} />
            <Route path="/seo-audit" component={SeoAudit} />
            <Route path="/on-page-optimization" component={OnPageOptimization} />
            <Route path="/backlink-analysis" component={BacklinkAnalysis} />
            <Route path="/content-optimization" component={ContentOptimization} />
            <Route path="/users" component={UsersPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/feature-comparison" component={FeatureComparisonPage} />
            
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

  useEffect(() => {
    const encodedUser = localStorage.getItem('user');
    if (encodedUser) {
      try {
        const decodedUser = JSON.parse(atob(encodedUser));
        setUser(decodedUser);
      } catch (error) {
        console.error("Lỗi khi giải mã user từ localStorage", error);
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    // Logic lưu vào localStorage đã được xử lý trong Auth.tsx
    navigate('/dashboard'); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setUser(null);
    navigate('/'); 
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Route /admin sẽ luôn được kiểm tra trước và luôn truy cập được */}
        <Route path="/admin" component={AdminPage} />

        {/* Đối với tất cả các route còn lại, ta mới kiểm tra trạng thái đăng nhập */}
        <Route>
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
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
