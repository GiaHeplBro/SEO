import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast"; // Sửa lại đường dẫn import
import { jwtDecode } from 'jwt-decode'; // Thêm import

// Import các icon và component UI
import { Sparkles, FileText, Search, Wand2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// --- Định nghĩa các kiểu dữ liệu ---
interface ContentOptimizationData {
  id: number;
  keyword: string;
  originalContent: string;
  optimizedContent: string;
  seoscore: number;
  readability: number;
  engagement: number;
  originality: number;
  createdAt: string;
}

interface ContentOptimizationPayload {
  userId: number; // Thêm userId
  keyword: string;
  originalContent: string;
  optimizationLevel: number;
  readabilityLevel: string;
  includeCitation: boolean;
  contentLenght: string;
}

// --- Khai báo hằng số bên ngoài component ---
const READABILITY_LEVELS = ["Dễ", "Trung bình", "Khó", "Nâng cao", "Chuyên gia"];
const CONTENT_LENGTH_LEVELS = ["Ngắn", "Trung bình", "Dài", "Toàn diện", "Chi tiết"];

// --- Khởi tạo axios instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// --- Các hàm gọi API ---
const createOptimization = async (payload: ContentOptimizationPayload): Promise<ContentOptimizationData> => {
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) throw new Error("Không tìm thấy token xác thực.");
  const { accessToken } = JSON.parse(storedTokens);

  const response = await api.post('/ContentOptimizations', payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

const fetchOptimizationHistory = async (userId: string | null): Promise<ContentOptimizationData[]> => {
  if (!userId) return [];
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) throw new Error("Không tìm thấy token xác thực.");
  const { accessToken } = JSON.parse(storedTokens);

  const response = await api.get(`/ContentOptimizations/user/${userId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return Array.isArray(response.data) ? response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
};

const ScoreCard = ({ title, score }: { title: string; score: number | null }) => {
  const getScoreColor = (s: number | null) => {
    if (s === null) return 'text-gray-500';
    if (s <= 50) return 'text-red-500';
    if (s <= 80) return 'text-amber-500';
    return 'text-green-500';
  };
  return (
    <Card className="text-center p-4">
      <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score ?? 'N/A'}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </Card>
  );
};


export default function ContentOptimization() {
  // --- State cho form nhập liệu ---
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [optimizationLevel, setOptimizationLevel] = useState<number[]>([3]); // Level từ 1-5
  const [readabilityPreference, setReadabilityPreference] = useState<number[]>([2]); // Mặc định là "Medium"
  const [contentLengthPreference, setContentLengthPreference] = useState<number[]>([2]); // Mặc định là "Medium"
  const [useCitations, setUseCitations] = useState(true);
  const [selectedOptimization, setSelectedOptimization] = useState<ContentOptimizationData | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();


  const userId = useMemo(() => {
    const storedTokens = localStorage.getItem('tokens');
    if (!storedTokens) return null;
    try {
      const { accessToken } = JSON.parse(storedTokens);
      const decodedToken: { user_ID: string } = jwtDecode(accessToken);
      return decodedToken.user_ID;
    } catch (e) { return null; }
  }, []);

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['optimizationHistory', userId],
    queryFn: () => fetchOptimizationHistory(userId),
    enabled: !!userId,
  });

  const mutation = useMutation({
    mutationFn: createOptimization,
    onSuccess: () => {
      toast({ title: "Thành công!", description: "Nội dung của bạn đã được tối ưu hóa." });
      queryClient.invalidateQueries({ queryKey: ['optimizationHistory', userId] });
    },
    onError: (error) => {
      toast({ title: "Thất bại", description: error.message, variant: "destructive" });
    },
  });

  // --- Hàm xử lý khi nhấn nút Optimize ---
  const handleOptimize = () => {
    if (!content || !targetKeyword) return;

    // Lấy userId từ token
    const storedTokens = localStorage.getItem('tokens');
    if (!storedTokens) {
      toast({ title: "Lỗi", description: "Vui lòng đăng nhập lại.", variant: "destructive" });
      return;
    }
    const { accessToken } = JSON.parse(storedTokens);
    const decodedToken: { user_ID: string } = jwtDecode(accessToken);
    const userId = parseInt(decodedToken.user_ID, 10);

    if (!userId) {
      toast({ title: "Lỗi", description: "Không thể xác thực người dùng.", variant: "destructive" });
      return;
    }

    // Tạo payload với cấu trúc và giá trị chính xác
    const payload: ContentOptimizationPayload = {
      userId: userId,
      keyword: targetKeyword,
      originalContent: content,
      optimizationLevel: optimizationLevel[0],
      readabilityLevel: READABILITY_LEVELS[readabilityPreference[0] - 1],
      includeCitation: false, // SỬA Ở ĐÂY 4: Mặc định là false      
      contentLenght: CONTENT_LENGTH_LEVELS[contentLengthPreference[0] - 1],

    };

    console.log("Gửi payload đã sửa cho Backend:", payload);
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center">
          Tối ưu nội dung <Sparkles className="ml-2 h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Nâng cao nội dung bằng AI để cải thiện xếp hạng tìm kiếm và mức độ tương tác          
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nhập nội dung</CardTitle>
              <CardDescription>Nhập nội dung để tối ưu cho SEO và khả năng đọc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-keyword">Từ khóa hoặc chủ đề</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="target-keyword" placeholder="Ví dụ: kỹ thuật tối ưu nội dung" value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content">Nội dung của bạn</Label>
                  <span className="text-xs text-muted-foreground">{content.length} ký tự</span>
                </div>
                <Textarea id="content" placeholder="Dán nội dung vào đây..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Cài đặt tối ưu</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Độ dài nội dung</Label>
                  <span className="text-sm font-medium">
                    {CONTENT_LENGTH_LEVELS[contentLengthPreference[0] - 1]}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={CONTENT_LENGTH_LEVELS.length}
                  step={1}
                  value={contentLengthPreference}
                  onValueChange={setContentLengthPreference}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><Label>Mức tối ưu</Label><span className="text-sm font-medium">Level {optimizationLevel[0]}</span></div>
                <Slider min={1} max={5} step={1} value={optimizationLevel} onValueChange={setOptimizationLevel} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><Label>Mức độ dễ đọc</Label><span className="text-sm font-medium">{READABILITY_LEVELS[readabilityPreference[0] - 1]}</span></div>
                <Slider min={1} max={READABILITY_LEVELS.length} step={1} value={readabilityPreference} onValueChange={setReadabilityPreference} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button className="ml-auto flex items-center gap-2" onClick={handleOptimize} disabled={mutation.isPending || !content || !targetKeyword}>
                {mutation.isPending ? "Đang tối ưu..." : <><Wand2 className="h-4 w-4" /><span>Tối ưu bằng AI</span></>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5" /> Lịch sử tối ưu</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {isLoadingHistory ? <p>Đang tải lịch sử...</p> :
                history && history.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {history.map(item => (
                      <AccordionItem value={`item-${item.id}`} key={item.id}>
                        <AccordionTrigger>
                          <div className="text-left">
                            <p className="font-semibold truncate">{item.keyword}</p>
                            <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {/* Nội dung chi tiết của kết quả */}
                          <div className="space-y-4 p-2">
                            <div>
                              <Label className="text-xs font-semibold">Nội dung đã tối ưu</Label>
                              <pre className="mt-1 border rounded-md p-2 bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap font-sans text-xs max-h-40 overflow-y-auto">
                                {item.optimizedContent ?? "Không có dữ liệu."}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Điểm nội dung</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <ScoreCard title="SEO Score" score={item.seoscore} />
                                <ScoreCard title="Readability" score={item.readability} />
                                <ScoreCard title="Engagement" score={item.engagement} />
                                <ScoreCard title="Originality" score={item.originality} />
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Không có lịch sử.</p>
                )
              }
            </CardContent>
          </Card>
        </div>

      </div>


    </div>
  );
}