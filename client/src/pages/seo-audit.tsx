import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Search, CheckCircle, XCircle, AlertCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import api from "@/axiosInstance";
import { ElementItem } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

interface AuditReport {
  id: number;
  url: string;
  overallScore: number;
  criticalIssue: string | number;
  warning: string | number;
  passedCheck: string | number;
  opportunity: string;
  createdAt: string;
}

const fetchAuditHistory = async (): Promise<AuditReport[]> => {
  const { data } = await api.get('/AuditReports');
  return data.sort((a: AuditReport, b: AuditReport) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const createAudit = async (url: string): Promise<AuditReport> => {
  const { data } = await api.post('/AuditReports', { url });
  return data;
};

const fetchElementsForReport = async (reportId: number): Promise<ElementItem[]> => {
  const { data } = await api.get(`/Elements?auditReportId=${reportId}`);
  return data.items || data;
};

export default function SeoAudit() {
  const [url, setUrl] = useState("");
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['auditHistory'],
    queryFn: fetchAuditHistory
  });
  
  const mutation = useMutation({
    mutationFn: createAudit,
    onSuccess: (newReport) => {
      toast({ title: "Thành công", description: `Đã bắt đầu phân tích cho ${newReport.url}` });
      setSelectedReport(newReport);
      queryClient.invalidateQueries({ queryKey: ['auditHistory'] });
    },
    onError: (error) => {
      toast({ title: "Thất bại", description: error.message, variant: 'destructive' });
    }
  });

  const { 
    data: auditElements, 
    isFetching: isFetchingElements // Sử dụng isFetching
  } = useQuery({
    queryKey: ['auditElements', selectedReport?.id],
    queryFn: () => fetchElementsForReport(selectedReport!.id),
    enabled: !!selectedReport,
  });

  const handleAnalyzeClick = () => {
    if (!url) {
      toast({ title: "Lỗi", description: "Vui lòng nhập một URL.", variant: "destructive" });
      return;
    }
    mutation.mutate(url);
  };
  
  const mapStatus = (apiStatus: string): "pass" | "warning" | "fail" => {
    if (apiStatus === "diffent") return "warning";
    if (apiStatus === "fail" || apiStatus === "error") return "fail";
    return "pass";
  };
  
  // Chỉ tính toán passedCount từ auditElements
  const passedCount = auditElements?.filter(item => mapStatus(item.status) === 'pass').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">SEO Audit</h1>
        <p className="text-gray-500 dark:text-gray-400">Phân tích toàn diện tình trạng và hiệu suất SEO của trang web của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Phân tích Website</CardTitle><CardDescription>Nhập URL để bắt đầu</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <Button className="flex items-center gap-2" onClick={handleAnalyzeClick} disabled={mutation.isPending}>
                  {mutation.isPending ? "Đang phân tích..." : <><Search className="h-4 w-4" /><span>Phân tích</span></>}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center"><History className="h-5 w-5 mr-2" /> Lịch sử Audit</CardTitle></CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {isLoadingHistory ? <p>Đang tải lịch sử...</p> : 
                <ul className="space-y-2">
                  {history?.map(report => (
                    <li key={report.id}>
                      <button onClick={() => setSelectedReport(report)} className={`w-full text-left p-2 rounded-md hover:bg-accent ${selectedReport?.id === report.id ? 'bg-accent border' : ''}`}>
                        <p className="font-semibold truncate">{report.url}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                          <span>Điểm: {report.overallScore}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              }
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!selectedReport ? (
            <Card className="h-full flex items-center justify-center min-h-[500px]">
              <div className="text-center text-gray-500">
                <p>Nhập một URL để bắt đầu phân tích</p>
                <p className="text-sm">hoặc chọn một báo cáo từ lịch sử để xem chi tiết.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in-50">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader>
                    <CardTitle>Kết quả Audit cho:</CardTitle>
                    <a href={selectedReport.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{selectedReport.url}</a>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <Progress value={selectedReport.overallScore} className="w-36 h-36 [transform:rotate(-90deg)] absolute [&>div]:stroke-blue-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-3xl font-bold">{selectedReport.overallScore}</span><span className="text-xl">/100</span>
                            <p className="text-sm mt-1">Điểm tổng thể</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:col-span-3">
                      <Card><CardContent className="p-4 flex items-center space-x-3"><div className="bg-red-100 rounded-full p-2"><XCircle className="h-5 w-5 text-red-600" /></div><div><p className="text-sm text-muted-foreground">Nghiêm trọng</p><p className="text-xl font-bold">{selectedReport.criticalIssue}</p></div></CardContent></Card>
                      <Card><CardContent className="p-4 flex items-center space-x-3"><div className="bg-amber-100 rounded-full p-2"><AlertCircle className="h-5 w-5 text-amber-600" /></div><div><p className="text-sm text-muted-foreground">Cảnh báo</p><p className="text-xl font-bold">{selectedReport.warning}</p></div></CardContent></Card>
                      {/* SỬA Ở ĐÂY 1: Đếm số lượng "Đã vượt qua" từ danh sách Elements */}
                      <Card><CardContent className="p-4 flex items-center space-x-3"><div className="bg-green-100 rounded-full p-2"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Đã vượt qua</p><p className="text-xl font-bold">{isFetchingElements ? '...' : passedCount}</p></div></CardContent></Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Chi tiết các yếu tố On-Page</CardTitle></CardHeader>
                <CardContent>
                  {/* SỬA Ở ĐÂY 2: Dùng isFetchingElements để tránh lỗi chồng chéo dữ liệu */}
                  {isFetchingElements ? <p className="text-center p-4">Đang tải chi tiết...</p> : 
                    <Accordion type="single" collapsible className="w-full">
                      {auditElements?.map((item) => (
                        <AccordionItem key={item.id} value={`item-${item.id}`}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center space-x-2 text-left">
                              {mapStatus(item.status) === "pass" ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : mapStatus(item.status) === "warning" ? <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                              <span>{item.element1 || "Chưa có tên yếu tố"}</span>
                              <Badge className="ml-2" variant={mapStatus(item.status) === "pass" ? "outline" : mapStatus(item.status) === "warning" ? "warning" : "destructive"}>
                                {mapStatus(item.status) === "pass" ? "Đã vượt qua" : mapStatus(item.status) === "warning" ? "Cảnh báo" : "Thất bại"}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-7">{item.currentValue || "Không có chi tiết."}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  }
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}