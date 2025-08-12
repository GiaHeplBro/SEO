import axios from 'axios';

// 1. Tạo một instance axios trung tâm (giữ nguyên)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 2. SỬA Ở ĐÂY: Thêm interceptor để tự động thêm token vào MỖI request
api.interceptors.request.use(
  (config) => {
    // Lấy chuỗi token đã được mã hóa từ localStorage
    const encodedTokens = localStorage.getItem('tokens');
    
    if (encodedTokens) {
      try {
        // Giải mã chuỗi bằng atob()
        const decodedString = atob(encodedTokens);
        // Chuyển chuỗi JSON thành object
        const { accessToken } = JSON.parse(decodedString);
        
        if (accessToken) {
          // Gắn token vào header Authorization theo chuẩn "Bearer"
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Lỗi khi giải mã hoặc đọc token từ localStorage", error);
        // Tùy chọn: Xóa token bị hỏng để tránh lỗi lặp lại
        // localStorage.removeItem('tokens');
        // localStorage.removeItem('user');
      }
    }
    
    // Trả về config đã được chỉnh sửa để request được gửi đi
    return config;
  },
  (error) => {
    // Xử lý lỗi của request
    return Promise.reject(error);
  }
);

export default api;
