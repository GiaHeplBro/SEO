import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Import các component UI (giả định bạn dùng shadcn/ui)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- Định nghĩa kiểu dữ liệu cho một User dựa trên database của bạn ---
interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  accountType: string;
  createdAt: string;
}

// --- Tạo một axios instance với base URL từ file .env ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- Hàm gọi API để lấy danh sách người dùng ---
// API này yêu cầu xác thực, nên chúng ta cần gửi kèm Access Token
const fetchUsers = async (): Promise<User[]> => {
  // Lấy token từ localStorage
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) {
    throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
  }

  const { accessToken } = JSON.parse(storedTokens);
  if (!accessToken) {
    throw new Error("Access token không hợp lệ. Vui lòng đăng nhập lại.");
  }

  // Gọi API với header Authorization
  const response = await api.get('/Users', {
    headers: {
      Authorization: `Bearer ${accessToken}`, // Gửi token theo chuẩn Bearer
    },
  });

  return response.data;
};

// --- Component chính của trang Users ---
export default function UsersPage() {
  // Sử dụng useQuery để fetch dữ liệu
  const { 
    data: users, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['users'], // Key để cache dữ liệu
    queryFn: fetchUsers, // Hàm để gọi API
    retry: 1, // Chỉ thử lại 1 lần nếu có lỗi
  });

  // --- Xử lý trạng thái đang tải ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  // --- Xử lý trạng thái lỗi ---
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">
          Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
        </p>
      </div>
    );
  }

  // --- Giao diện chính khi có dữ liệu ---
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Tên người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Loại tài khoản</TableHead>
              <TableHead>Ngày tham gia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      {/* Nếu user.avatar có link ảnh thì hiển thị, nếu không thì hiển thị fallback */}
                      <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.accountType}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}