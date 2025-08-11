import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Import các component UI
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
import api from '@/axiosInstance'; // Sử dụng lại instance axios đã có

// SỬA Ở ĐÂY 1: Cập nhật interface cho khớp với API mới
interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
  // Thuộc tính 'accountType' đã được xóa
}

// --- Hàm gọi API để lấy danh sách người dùng ---
const fetchUsers = async (): Promise<User[]> => {
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) {
    throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
  }
  const { accessToken } = JSON.parse(storedTokens);
  if (!accessToken) {
    throw new Error("Access token không hợp lệ. Vui lòng đăng nhập lại.");
  }

  const response = await api.get('/Users', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

// --- Component chính của trang Users ---
export default function UsersPage() {
  const { 
    data: users, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">
          Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Tên người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              {/* SỬA Ở ĐÂY 2: Xóa cột "Loại tài khoản" */}
              <TableHead>Ngày tham gia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
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
                  <Badge variant={user.role.toLowerCase() === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                {/* SỬA Ở ĐÂY 3: Xóa ô hiển thị "Loại tài khoản" */}
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
