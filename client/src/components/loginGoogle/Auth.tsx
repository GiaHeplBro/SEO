import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// SỬA Ở ĐÂY 1: Import instance axios trung tâm
import api from '@/axiosInstance'; 

// Định nghĩa kiểu dữ liệu UserProfile
interface UserProfile {
  email?: string;
  fullname?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

// SỬA Ở ĐÂY 2: Xóa bỏ việc tạo axios instance cục bộ
// const api = axios.create({ ... });

// Component Auth
const Auth: React.FC<{ onLoginSuccess: (user: UserProfile) => void }> = ({ onLoginSuccess }) => {

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("Không nhận được credential từ Google.");
      return;
    }

    try {
      // Bây giờ 'api' đã là instance có sẵn interceptor để tự động thêm token
      const response = await api.post(
        '/Authens/login-with-google',
        JSON.stringify(credentialResponse.credential),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data && response.data.success && response.data.accessToken) {
        
        const { accessToken, refreshToken } = response.data;
        const decodedUser: UserProfile = jwtDecode(accessToken);
        
        const userToStore = {
            ...decodedUser,
            fullName: decodedUser.fullname 
        };

        // Mã hóa và lưu vào localStorage
        localStorage.setItem('user', btoa(JSON.stringify(userToStore)));
        localStorage.setItem('tokens', btoa(JSON.stringify({ accessToken, refreshToken })));

        onLoginSuccess(userToStore);

      } else {
        console.error("Lỗi: Dữ liệu trả về từ API không đúng định dạng.", response.data);
        alert("Đã xảy ra lỗi khi xử lý thông tin đăng nhập từ máy chủ.");
      }

    } catch (error) {
      console.error('Lỗi khi gọi API login-with-google:', error);
      alert('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    alert('Đăng nhập bằng Google thất bại.');
  };

  return (
    <div 
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/imageuploadv3.appspot.com/o/TestFile%2F3d-network-communications-background-with-flowing-floating-particles.jpg?alt=media&token=dd55b96f-4e4f-454b-869a-ef54b22241c5')`,
      }}
    >
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg border-white/20 text-white animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-300" />
            <CardTitle className="text-3xl font-bold tracking-wider">
              SEO-Boost AI
            </CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Welcome back! Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-gray-400 justify-center">
          <p>
            By continuing, you agree to our Terms of Service <br /> and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
