import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, Mail, Calendar, Crown, ShieldCheck, Edit, X, Check } from 'lucide-react';

// Import UI components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"; // Đường dẫn chuẩn của shadcn/ui

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- Hàm fetch user theo ID ---
const fetchCurrentUser = async (userId: string | null): Promise<UserProfile> => {
  if (!userId) throw new Error("User ID không hợp lệ.");
  
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) throw new Error("Không tìm thấy token xác thực.");
  const { accessToken } = JSON.parse(storedTokens);
  if (!accessToken) throw new Error("Access token không hợp lệ.");

  const response = await api.get(`/Users/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  // API đã trả về đúng một object, nên ta trả về thẳng response.data
  return response.data;
};

// --- Hàm update user ---
const updateCurrentUser = async (updatedData: { fullName: string }): Promise<UserProfile> => {
    const storedTokens = localStorage.getItem('tokens');
    if (!storedTokens) throw new Error("Không tìm thấy token xác thực.");
    const { accessToken } = JSON.parse(storedTokens);
    const decodedToken: { user_ID: string } = jwtDecode(accessToken);
    const userId = decodedToken.user_ID;
    if (!userId) throw new Error("Không tìm thấy User ID trong token để cập nhật.");

    const response = await api.put(`/Users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};

// --- Component trang Profile ---
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = useMemo(() => {
    const storedTokens = localStorage.getItem('tokens');
    if (!storedTokens) return null;
    try {
      const { accessToken } = JSON.parse(storedTokens);
      const decodedToken: { user_ID: string } = jwtDecode(accessToken);
      return decodedToken.user_ID;
    } catch (e) {
      console.error("Failed to decode token", e);
      return null;
    }
  }, []);

  const { data: user, isLoading, isError, error } = useQuery({
    // Query key động, duy nhất cho mỗi user
    queryKey: ['currentUser', userId], 
    queryFn: () => fetchCurrentUser(userId),
    // Chỉ chạy khi có userId
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
      // Cập nhật cache với đúng queryKey động
      queryClient.setQueryData(['currentUser', userId], data);
      setIsEditing(false);
    },
    onError: (err) => {
      toast({ title: "Thất bại", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = () => mutation.mutate(formData);
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