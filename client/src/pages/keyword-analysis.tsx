import { Search, Rocket, TrendingUp, BarChart2, Download, Sparkles, Wand2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import api from "@/axiosInstance";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from 'jwt-decode';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface Keyword {
  id: number;
  keyword1: string; // Tên thật từ API là keyword1
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  intent: string;
  rank: number;
}
interface Keyword {
  id: number;
  keyword1: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  intent: string;
}
interface RankTrackingItem { id: number; userId: number; keyword: string; rank: number; }
interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  totalItems: number; // <<< THÊM DÒNG NÀY VÀO
  currentPage: number;
}


const searchKeywordsApi = async ({ keyword, pageParam = 1 }: { keyword: string; pageParam?: number }): Promise<PaginatedResponse<Keyword>> => {
  // Logic này rất quan trọng: chỉ gọi API khi có từ khóa
if (!keyword.trim()) {
  // Thêm totalItems: 0 vào đây
  return { items: [], totalPages: 0, totalItems: 0, currentPage: 1 };
}
  const { data } = await api.get(`/Keywords/search/${keyword}/${pageParam}/10`);
  return data;
};

const generateKeywordsApi = async (inputKeyword: string): Promise<any> => {
  const { data } = await api.post("/Keywords/search", { input_keyword: inputKeyword });
  return data;
};

const fetchRankTrackingsApi = async ({ userId, pageParam = 1 }: { userId: string | null, pageParam?: number }): Promise<PaginatedResponse<RankTrackingItem>> => {
  if (!userId) return { items: [], totalPages: 0, totalItems: 0, currentPage: 1 };
  const { data } = await api.get(`/RankTrackings/rank-tracking/${userId}/${pageParam}/10`);
  return data;
};

const addRankTrackingApi = async ({ userId, keyword }: { userId: string, keyword: string }) => {
  const { data } = await api.post('/RankTrackings/rank-tracking', {
    input_keyword: keyword,
    user_id: userId
  });
  return data;
};

export default function KeywordAnalysis() {
  const [filterTerm, setFilterTerm] = useState("");
  const [aiSeedKeyword, setAiSeedKeyword] = useState("");
  const [newTrackingKeyword, setNewTrackingKeyword] = useState("");

  const debouncedFilterTerm = useDebounce(filterTerm, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const userId = useMemo(() => {
    try {
      const storedTokens = localStorage.getItem('tokens');
      const { accessToken } = JSON.parse(storedTokens!);
      const decodedToken: { user_ID: string } = jwtDecode(accessToken);
      return decodedToken.user_ID;
    } catch { return null; }
  }, []);

  // --- Sử dụng useInfiniteQuery cho Live Search ---
  const {
    data: searchedData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetching: isSearching,
  } = useInfiniteQuery({
    queryKey: ['keywordsSearch', debouncedFilterTerm],
    queryFn: ({ pageParam }) => searchKeywordsApi({ keyword: debouncedFilterTerm, pageParam }),
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  });
  // Dữ liệu hiển thị chính là kết quả của query này
  const searchedKeywords = searchedData?.pages.flatMap(page => page.items) || [];

  // --- Sử dụng useInfiniteQuery cho Rank Tracking ---
  const {
    data: rankTrackingData,
    fetchNextPage: fetchNextRankPage,
    hasNextPage: hasNextRankPage,
    isLoading: isLoadingRankings,
    isFetching: isFetchingRankings
  } = useInfiniteQuery({
    queryKey: ['rankTrackings', userId],
    queryFn: ({ pageParam }) => fetchRankTrackingsApi({ userId, pageParam }),
    getNextPageParam: (lastPage) => lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
    enabled: !!userId,
  });
  const rankTrackings = rankTrackingData?.pages.flatMap(page => page.items) || [];

  const generationMutation = useMutation({
    mutationFn: generateKeywordsApi,
    onSuccess: () => {
      toast({ title: "Thành công!", description: "Đã tạo và thêm các từ khóa mới." });
      // Sau khi tạo mới, ta có thể làm mới lại query search cuối cùng
      queryClient.invalidateQueries({ queryKey: ['keywordsSearch', debouncedFilterTerm] });
    },
    onError: (error) => {
      toast({ title: "Thất bại", description: error.message, variant: 'destructive' });
    }
  });

  const handleGenerateClick = () => {
    if (!aiSeedKeyword) {
      toast({ title: "Lỗi", description: "Vui lòng nhập từ khóa gốc để tạo.", variant: "destructive" });
      return;
    }
    generationMutation.mutate(aiSeedKeyword);
  };

  const addTrackingMutation = useMutation({
    mutationFn: addRankTrackingApi,
    onSuccess: () => {
      toast({ title: "Thành công!", description: "Đã thêm từ khóa vào danh sách theo dõi." });
      queryClient.invalidateQueries({ queryKey: ['rankTrackings', userId] });
      setNewTrackingKeyword("");
    },
    onError: (error) => toast({ title: "Thất bại", description: error.message, variant: 'destructive' })
  });

  const handleAddTrackingClick = () => {
    if (!newTrackingKeyword) return;
    if (!userId) {
      toast({ title: "Lỗi", description: "Vui lòng đăng nhập lại.", variant: "destructive" });
      return;
    }
    addTrackingMutation.mutate({ userId, keyword: newTrackingKeyword });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Keyword Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Discover and generate high-performing keywords for your content strategy.
        </p>
      </div>

      <Tabs defaultValue="research">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-4">
          <TabsTrigger value="research">Keyword Research</TabsTrigger>
          <TabsTrigger value="tracking">Rank Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-purple-500" /> AI Keyword Generation</CardTitle>
              <CardDescription>Enter a seed keyword, and our AI will generate a list of related, high-potential keywords.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Wand2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="e.g., 'digital marketing'"
                    value={aiSeedKeyword}
                    onChange={(e) => setAiSeedKeyword(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerateClick} disabled={generationMutation.isPending}>
                  {generationMutation.isPending ? "Generating..." : <><Rocket className="h-4 w-4 mr-2" /><span>Generate</span></>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Search Keywords</CardTitle><CardDescription>Live search for keywords in our database.</CardDescription></CardHeader>
            <CardContent>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Enter keyword to search..." value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} />
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis Results</CardTitle>

              <CardDescription>
                {/* SỬA Ở ĐÂY 2: Cập nhật lại logic hiển thị mô tả */}
                {isSearching ? `Searching for "${debouncedFilterTerm}"...` :
                  debouncedFilterTerm ? `Found ${searchedKeywords.length} results for "${debouncedFilterTerm}"` :
                    "Enter a keyword in the search boxes above to begin."}
              </CardDescription>

            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Keyword</TableHead>
                    <TableHead className="text-center">Search Volume</TableHead>
                    <TableHead className="text-center">Difficulty</TableHead>
                    <TableHead className="text-center">CPC ($)</TableHead>
                    <TableHead className="text-center">Competition</TableHead>
                    <TableHead className="text-center">Intent</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody>
                  {/* SỬA Ở ĐÂY 3: Cập nhật lại logic render bảng */}
                  {isSearching ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">Searching...</TableCell></TableRow>
                  ) : searchedKeywords.length > 0 ? (
                    searchedKeywords.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.keyword1}</TableCell>
                        <TableCell className="text-center">{item.searchVolume.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                              <div className={`h-full rounded-full ${item.difficulty > 70 ? "bg-red-500" : item.difficulty > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${item.difficulty}%` }} />
                            </div>
                            <span>{item.difficulty}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">${item.cpc}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.competition === "High" ? "destructive" : item.competition === "Medium" ? "secondary" : "outline"}>
                            {item.competition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{item.intent}</Badge></TableCell>
                        <TableCell className="text-center">{item.trend === "True" ? <TrendingUp className="inline h-4 w-4 text-green-500" /> : <BarChart2 className="inline h-4 w-4 text-gray-500" />}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">No results. Enter a keyword to start searching.</TableCell></TableRow>
                  )}
                </TableBody>


              </Table>


              {hasNextSearchPage && (
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={() => fetchNextSearchPage()} disabled={isSearching}>
                    {isSearching ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle>Add Keyword to Track</CardTitle>
              <CardDescription>Enter a keyword you want to monitor its ranking over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input placeholder="e.g., 'best seo tools'" value={newTrackingKeyword} onChange={(e) => setNewTrackingKeyword(e.target.value)} />
                </div>
                <Button onClick={handleAddTrackingClick} disabled={addTrackingMutation.isPending}>
                  {addTrackingMutation.isPending ? "Adding..." : <><PlusCircle className="h-4 w-4 mr-2" /><span>Add</span></>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Keyword Rank Tracking</CardTitle><CardDescription>Your monitored keyword positions.</CardDescription></CardHeader>
            <CardContent>
              {isLoadingRankings ? <div className="text-center p-12">Loading...</div> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Current Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankTrackings.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.keyword}</TableCell>
                        <TableCell className="text-center"><Badge>{item.rank}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              }
              {hasNextRankPage && <div className="text-center mt-4"><Button variant="outline" onClick={() => fetchNextRankPage()} disabled={isFetchingRankings}>Load More</Button></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}