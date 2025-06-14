import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // SỬA Ở ĐÂY 1: Import jwt-decode

// Định nghĩa kiểu dữ liệu UserProfile để khớp với dữ liệu trong token
interface UserProfile {
  // Thêm các trường có trong token của bạn
  email?: string;
  fullname?: string; // Chú ý: trong token có thể là 'fullname' hoặc 'fullName'
  role?: string;
  // Các trường chuẩn của JWT
  exp?: number;
  iat?: number;
}

// Khởi tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Component Auth
const Auth: React.FC<{ onLoginSuccess: (user: UserProfile) => void }> = ({ onLoginSuccess }) => {

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("Không nhận được credential từ Google.");
      return;
    }

    try {
      const response = await api.post(
        '/Authens/login-with-google',
        JSON.stringify(credentialResponse.credential),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // SỬA Ở ĐÂY 2: Thay đổi toàn bộ logic xử lý response
      if (response.data && response.data.success && response.data.accessToken) {
        
        const { accessToken, refreshToken } = response.data;

        // BƯỚC QUAN TRỌNG: Giải mã accessToken để lấy thông tin user
        const decodedUser: UserProfile = jwtDecode(accessToken);
        
        // Đổi tên 'fullname' thành 'fullName' để khớp với các component khác (nếu cần)
        const userToStore = {
            ...decodedUser,
            fullName: decodedUser.fullname 
        };

        // Lưu user đã giải mã và tokens vào localStorage
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('tokens', JSON.stringify({ accessToken, refreshToken }));

        // Gọi callback để báo cho App.tsx biết đã đăng nhập thành công
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
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
    }}>
        <h1>Chào mừng đến với SEO Boost AI</h1>
        <p>Vui lòng đăng nhập để tiếp tục</p>
        <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
        />
    </div>
  );
};

export default Auth;