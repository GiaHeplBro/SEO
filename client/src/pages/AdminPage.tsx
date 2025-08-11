import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

const adminApi = axios.create({
  baseURL: 'https://localhost:7144',
});

// --- Dữ liệu giả và Interfaces ---

interface Transaction {
  id: number;
  walletId: number;
  money: number;
  description: string;
  type: string;
  status: 'Pending' | 'Completed' | 'Failed';
  bankTransId: string;
  createdAt: string;
  wallet?: { user?: { fullName: string; } }
}

interface Subscription {
  id: number;
  userId: number;
  accountTypeId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  accountType: { name: string; };
  user: { fullName: string; }
}

// SỬA Ở ĐÂY: Thêm kiểu Transaction[] cho mockTransactions
const mockTransactions: Transaction[] = [
  {
    id: 1,
    walletId: 101,
    money: 370000,
    description: "Nâng cấp gói Pro - Tháng 07/2025",
    type: "Purchase",
    status: "Pending",
    bankTransId: "FT2507151234",
    createdAt: "2025-07-25T10:30:00Z",
    wallet: { user: { fullName: "Nguyễn Văn An" } }
  },
  {
    id: 2,
    walletId: 102,
    money: 99000,
    description: "Mua lẻ dịch vụ SEO Audit",
    type: "Purchase",
    status: "Completed",
    bankTransId: "FT2507155678",
    createdAt: "2025-07-24T15:00:00Z",
    wallet: { user: { fullName: "Trần Thị Bích" } }
  },
  {
    id: 3,
    walletId: 103,
    money: 250000,
    description: "Nâng cấp gói Basic - Tháng 07/2025",
    type: "Purchase",
    status: "Pending",
    bankTransId: "FT2507159012",
    createdAt: "2025-07-25T11:00:00Z",
    wallet: { user: { fullName: "Lê Văn Cường" } }
  },
  {
    id: 4,
    walletId: 101,
    money: 89000,
    description: "Mua lẻ dịch vụ Backlink Analysis",
    type: "Purchase",
    status: "Failed",
    bankTransId: "FT2507141122",
    createdAt: "2025-07-23T09:00:00Z",
    wallet: { user: { fullName: "Nguyễn Văn An" } }
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    userId: 101,
    accountTypeId: 2,
    startDate: "2025-07-15T00:00:00Z",
    endDate: "2025-08-15T00:00:00Z",
    isActive: true,
    accountType: { name: "Gói Basic" },
    user: { fullName: "Nguyễn Văn An" }
  },
  {
    id: 2,
    userId: 102,
    accountTypeId: 3,
    startDate: "2025-07-01T00:00:00Z",
    endDate: "2025-08-01T00:00:00Z",
    isActive: true,
    accountType: { name: "Gói Pro" },
    user: { fullName: "Trần Thị Bích" }
  },
  {
    id: 3,
    userId: 104,
    accountTypeId: 1,
    startDate: "2025-06-20T00:00:00Z",
    endDate: null,
    isActive: true,
    accountType: { name: "Gói Free" },
    user: { fullName: "Phạm Thị Dung" }
  }
];

// --- Các hàm gọi API ---
const fetchTransactions = async (): Promise<Transaction[]> => {
  console.log("Đang dùng dữ liệu Transactions giả.");
  return Promise.resolve(mockTransactions);
  // const { data } = await adminApi.get('/api/Transactions');
  // return data.items || [];
};

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  console.log("Đang dùng dữ liệu Subscriptions giả.");
  return Promise.resolve(mockSubscriptions);
  // const { data } = await adminApi.get('/api/UserAccountSubscriptions');
  // return data || [];
};

const updateTransactionStatus = async ({ id, status }: { id: number; status: string }) => {
  console.log(`(Giả lập) Cập nhật transaction ${id} thành status: ${status}`);
  return Promise.resolve({ success: true });
  // const { data } = await adminApi.put('/api/Transactions/UpdateStatus', {
  //   transactionId: id,
  //   newStatus: status,
  // });
  // return data;
};


export default function AdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: fetchTransactions,
  });

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: fetchSubscriptions,
  });
  
  const statusMutation = useMutation({
    mutationFn: updateTransactionStatus,
    onSuccess: () => {
      toast({ title: "Thành công!", description: "Đã cập nhật trạng thái giao dịch." });
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
    },
    onError: (error) => {
      toast({ title: "Thất bại", description: error.message, variant: "destructive" });
    }
  });

  const handleStatusUpdate = (id: number, status: 'Completed' | 'Failed') => {
    statusMutation.mutate({ id, status });
  };
  
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      default: // Pending
        return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600">Đang chờ</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Bảng điều khiển Admin</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? <p>Đang tải giao dịch...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.wallet?.user?.fullName || 'Không rõ'}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.money.toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell>{new Date(tx.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell><StatusBadge status={tx.status} /></TableCell>
                      <TableCell className="text-right">
                        {tx.status.toLowerCase() === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleStatusUpdate(tx.id, 'Completed')}>
                              <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleStatusUpdate(tx.id, 'Failed')}>
                               <XCircle className="h-4 w-4 mr-2" /> Hủy
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách gói người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSubscriptions ? <p>Đang tải danh sách...</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions?.map(sub => (
                      <TableRow key={sub.id}>
                          <TableCell>{sub.user?.fullName || 'Không rõ'}</TableCell>
                          <TableCell>{sub.accountType?.name || 'Không rõ'}</TableCell>
                          <TableCell><Badge variant={sub.isActive ? "default" : "secondary"}>{sub.isActive ? 'Kích hoạt' : 'Không hoạt động'}</Badge></TableCell>
                          <TableCell>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}