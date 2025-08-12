import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Calendar, Crown, ShieldCheck, Edit, X, Check } from 'lucide-react';

// Import UI components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"; // Sửa lại đường dẫn import đúng
import api from '@/axiosInstance'; // SỬA Ở ĐÂY 1: Dùng instance axios trung tâm

// --- Interface ---
interface UserProfile {
  id: number;
  user_ID?: string; // Từ token
  fullName: string;
  fullname?: string; // Từ token
  email: string;
  role: string;
  avatar: string;
  accountType: string;
  createdAt: string;
}

// SỬA Ở ĐÂY 2: Đơn giản hóa các hàm API
// --- Hàm fetch user theo ID ---
const fetchCurrentUser = async (userId: string | null): Promise<UserProfile> => {
  if (!userId) throw new Error("User ID không hợp lệ.");
  // Không cần xử lý token ở đây nữa, axiosInstance sẽ tự làm
  const { data } = await api.get(`/Users/${userId}`);
  return data;
};

// --- Hàm update user ---
const updateCurrentUser = async (updatedData: { fullName: string; userId: string | null }): Promise<UserProfile> => {
    if (!updatedData.userId) throw new Error("Không tìm thấy User ID để cập nhật.");
    // Không cần xử lý token ở đây nữa
    const { data } = await api.put(`/Users/${updatedData.userId}`, { fullName: updatedData.fullName });
    return data;
};

// --- Component trang Profile ---
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = useMemo(() => {
    try {
      // Logic giải mã token để lấy userId vẫn cần thiết cho queryKey
      const encodedTokens = localStorage.getItem('tokens');
      if (!encodedTokens) return null;
      const { accessToken } = JSON.parse(atob(encodedTokens));
      const decodedToken: { user_ID: string } = jwtDecode(accessToken);
      return decodedToken.user_ID;
    } catch (e) {
      console.error("Failed to decode token", e);
      return null;
    }
  }, []);

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser', userId], 
    queryFn: () => fetchCurrentUser(userId),
    enabled: !!userId, 
  });

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || user.fullname || '' });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (data) => {
      toast({ title: "Thành công", description: "Hồ sơ của bạn đã được cập nhật." });
      queryClient.setQueryData(['currentUser', userId], data);
      setIsEditing(false);
    },
    onError: (err) => {
      toast({ title: "Thất bại", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    mutation.mutate({ ...formData, userId });
  };
  const handleCancel = () => {
    if (user) setFormData({ fullName: user.fullName || user.fullname || '' });
    setIsEditing(false);
  };

  if (isLoading) return <div className="p-8">Đang tải thông tin cá nhân...</div>;
  if (!userId || isError) {
    return <div className="p-8 text-red-500">Lỗi: Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</div>;
  }
  
  const displayName = user?.fullName || user?.fullname || "Chưa có tên";
  const displayAvatarFallback = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Hồ sơ cá nhân</CardTitle>
              <CardDescription>Xem và chỉnh sửa thông tin của bạn tại đây.</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="text-3xl">{displayAvatarFallback}</AvatarFallback>
            </Avatar>
            {isEditing ? (
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="text-2xl font-bold text-center h-12"
              />
            ) : (
              <h2 className="text-2xl font-bold">{displayName}</h2>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span className="ml-auto text-muted-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <Crown className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="font-medium">Type:</span>
              <span className="ml-auto text-muted-foreground">{user?.accountType}</span>
            </div>
             <div className="flex items-center">
               <ShieldCheck className="w-5 h-5 mr-3 text-muted-foreground" />
               <span className="font-medium">Role:</span>
               <span className="ml-auto text-muted-foreground">{user?.role}</span>
             </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="font-medium">Ngày tham gia:</span>
              <span className="ml-auto text-muted-foreground">
                {user && user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </span>
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Hủy
            </Button>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : <><Check className="h-4 w-4 mr-2" /> Lưu thay đổi</>}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
