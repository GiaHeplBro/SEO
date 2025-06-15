import { useState } from "react";
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
const READABILITY_LEVELS = ["Easy", "Medium", "Hard", "Advanced", "Expert"];

const CONTENT_LENGTH_LEVELS = ["Short", "Medium", "Long", "Comprehensive", "In-depth"];

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

const fetchOptimizationHistory = async (): Promise<ContentOptimizationData[]> => {
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) throw new Error("Không tìm thấy token xác thực.");
  const { accessToken } = JSON.parse(storedTokens);

  const response = await api.get('/ContentOptimizations', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.sort((a: ContentOptimizationData, b: ContentOptimizationData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['optimizationHistory'],
    queryFn: fetchOptimizationHistory,
  });

  const mutation = useMutation({
    mutationFn: createOptimization,
    onSuccess: (data) => {
      toast({ title: "Thành công!", description: "Nội dung của bạn đã được tối ưu hóa." });
      setSelectedOptimization(data);
      queryClient.invalidateQueries({ queryKey: ['optimizationHistory'] });
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
      includeCitation: useCitations,
      contentLenght: CONTENT_LENGTH_LEVELS[contentLengthPreference[0] - 1],
    };

    console.log("Gửi payload đã sửa cho Backend:", payload);
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center">
          Content Optimization <Sparkles className="ml-2 h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          AI-powered content enhancement for better search rankings and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Input</CardTitle>
              <CardDescription>Enter your content to optimize for SEO and readability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-keyword">Target Keyword or Topic</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="target-keyword" placeholder="e.g., content optimization techniques" value={targetKeyword} onChange={(e) => setTargetKeyword(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content">Your Content</Label>
                  <span className="text-xs text-muted-foreground">{content.length} characters</span>
                </div>
                <Textarea id="content" placeholder="Paste your content here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[200px]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Optimization Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <Label>Content Length</Label>
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
                <div className="flex justify-between items-center"><Label>Optimization Level</Label><span className="text-sm font-medium">Level {optimizationLevel[0]}</span></div>
                <Slider min={1} max={5} step={1} value={optimizationLevel} onValueChange={setOptimizationLevel} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><Label>Readability Level</Label><span className="text-sm font-medium">{READABILITY_LEVELS[readabilityPreference[0] - 1]}</span></div>
                <Slider min={1} max={READABILITY_LEVELS.length} step={1} value={readabilityPreference} onValueChange={setReadabilityPreference} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Include Citations</Label><p className="text-sm text-muted-foreground">Add high-quality citations to support claims</p></div>
                <Switch checked={useCitations} onCheckedChange={setUseCitations} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button className="ml-auto flex items-center gap-2" onClick={handleOptimize} disabled={mutation.isPending || !content || !targetKeyword}>
                {mutation.isPending ? "Optimizing..." : <><Wand2 className="h-4 w-4" /><span>Optimize with AI</span></>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5" /> Optimization History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? <p>Loading history...</p> : (
                <ul className="space-y-2">
                  {history?.map(item => (
                    <li key={item.id}>
                      <button onClick={() => setSelectedOptimization(item)} className="w-full text-left p-2 rounded-md hover:bg-accent">
                        <p className="font-semibold truncate">{item.keyword}</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedOptimization && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Optimization Result</CardTitle>
            <CardDescription>Result for "{selectedOptimization.keyword}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Optimized Content</Label>
                <pre className="mt-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap font-sans text-sm min-h-[400px]">
                  {selectedOptimization.optimizedContent}
                </pre>
              </div>
              <div className="space-y-4">
                <Label>Content Scores</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center p-4"><p className="text-2xl font-bold">{selectedOptimization.seoscore}</p><p className="text-sm text-muted-foreground">SEO Score</p></Card>
                  <Card className="text-center p-4"><p className="text-2xl font-bold">{selectedOptimization.readability}</p><p className="text-sm text-muted-foreground">Readability</p></Card>
                  <Card className="text-center p-4"><p className="text-2xl font-bold">{selectedOptimization.engagement}</p><p className="text-sm text-muted-foreground">Engagement</p></Card>
                  <Card className="text-center p-4"><p className="text-2xl font-bold">{selectedOptimization.originality}</p><p className="text-sm text-muted-foreground">Originality</p></Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}