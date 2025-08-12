import { Search, Rocket, TrendingUp, BarChart2, Sparkles, Wand2, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import api from "@/axiosInstance"; // Quan trọng: Mọi API call đều dùng instance này
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from 'jwt-decode';

// --- Custom Hook Debounce ---
function useDebounce(value: string, delay: number): string {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

// --- Interfaces ---
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
interface RankTrackingItem { 
    id: number; 
    userId: number; 
    keyword: string; 
    rank: number; 
}
interface PaginatedResponse<T> {
    items: T[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
}


// --- Các hàm gọi API ---
// Tất cả các hàm này đều dùng 'api' instance đã được import, nên sẽ tự động có token
const searchKeywordsApi = async ({ keyword, pageParam = 1 }: { keyword: string; pageParam?: number }): Promise<PaginatedResponse<Keyword>> => {
    if (!keyword.trim()) {
        return { items: [], totalPages: 0, totalItems: 0, currentPage: 1 };
    }
    const requestBody = {
        pageIndex: pageParam,
        pageSize: 10,
        keyword: keyword,
        competition: "",
        intent: "",
        trend: "",
        sortBy: "",
        sortOrder: ""
    };
    const { data } = await api.post(`/Keywords/search-keyword`, requestBody);
    return data;
};

const generateKeywordsApi = async (inputKeyword: string): Promise<any> => {
    const { data } = await api.post("/Keywords/search", { input_keyword: inputKeyword });
    return data;
};

const fetchRankTrackingsApi = async ({ userId, pageParam = 1 }: { userId: string | null; pageParam?: number }): Promise<PaginatedResponse<RankTrackingItem>> => {
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

const updateRankTrackingApi = async (userId: string) => {
    const { data } = await api.post('/RankTrackings/update-rank-tracking', parseInt(userId, 10), {
        headers: { 'Content-Type': 'application/json' }
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
            const encodedTokens = localStorage.getItem('tokens');
            if (!encodedTokens) return null;
            const { accessToken } = JSON.parse(atob(encodedTokens));
            const decodedToken: { user_ID: string } = jwtDecode(accessToken);
            return decodedToken.user_ID;
        } catch { return null; }
    }, []);

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
    const searchedKeywords = searchedData?.pages.flatMap(page => page.items) || [];

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
            queryClient.invalidateQueries({ queryKey: ['keywordsSearch', debouncedFilterTerm] });
        },
        onError: (error) => { toast({ title: "Thất bại", description: error.message, variant: "destructive" }); }
    });

    const addTrackingMutation = useMutation({
        mutationFn: addRankTrackingApi,
        onSuccess: () => {
            toast({ title: "Thành công!", description: "Đã thêm từ khóa vào danh sách theo dõi." });
            queryClient.invalidateQueries({ queryKey: ['rankTrackings', userId] });
            setNewTrackingKeyword("");
        },
        onError: (error) => toast({ title: "Thất bại", description: error.message, variant: 'destructive' })
    });

    const updateRankMutation = useMutation({
        mutationFn: updateRankTrackingApi,
        onSuccess: () => {
            toast({ title: "Đang cập nhật", description: "Hệ thống đang cập nhật lại thứ hạng. Danh sách sẽ được làm mới sau giây lát." });
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['rankTrackings', userId] });
            }, 5000); 
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

    const handleAddTrackingClick = () => {
        if (!newTrackingKeyword || !userId) return;
        addTrackingMutation.mutate({ userId, keyword: newTrackingKeyword });
    };
    
    const handleUpdateRankClick = () => {
        if (!userId) {
            toast({ title: "Lỗi", description: "Không thể xác thực người dùng.", variant: "destructive" });
            return;
        }
        updateRankMutation.mutate(userId);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Phân tích từ khóa</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Khám phá, tạo và theo dõi các từ khóa giá trị nhất của bạn.
                </p>
            </div>

            <Tabs defaultValue="research">
                <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-4">
                    <TabsTrigger value="research">Nghiên cứu từ khóa</TabsTrigger>
                    <TabsTrigger value="tracking">Theo dõi thứ hạng</TabsTrigger>
                </TabsList>

                <TabsContent value="research" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Sparkles className="h-5 w-5 mr-2 text-purple-500" /> Tạo từ khóa AI</CardTitle>
                            <CardDescription>Nhập một từ khóa tiềm năng và AI sẽ tạo ra danh sách các từ khóa liên quan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <Wand2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" placeholder="e.g., 'digital marketing'" value={aiSeedKeyword} onChange={(e) => setAiSeedKeyword(e.target.value)} />
                                </div>
                                <Button onClick={handleGenerateClick} disabled={generationMutation.isPending}>
                                    {generationMutation.isPending ? "Generating..." : <><Rocket className="h-4 w-4 mr-2" /><span>Generate</span></>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Tìm kiếm từ khóa</CardTitle><CardDescription>Tìm kiếm trực tiếp các từ khóa trong cơ sở dữ liệu.</CardDescription></CardHeader>
                        <CardContent>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="Nhập từ khóa để tìm kiếm..." value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Kết quả phân tích từ khóa</CardTitle>
                            <CardDescription>
                                {isSearching ? `Searching...` : 
                                 debouncedFilterTerm ? `Found ${searchedData?.pages[0]?.totalItems || 0} results for "${debouncedFilterTerm}"` :
                                 "Nhập từ khóa vào ô tìm kiếm để bắt đầu."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">Từ khóa</TableHead>
                                        <TableHead className="text-center">Lượng tìm kiếm</TableHead>
                                        <TableHead className="text-center">Độ khó</TableHead>
                                        <TableHead className="text-center">CPC ($)</TableHead>
                                        <TableHead className="text-center">Mức cạnh tranh</TableHead>
                                        <TableHead className="text-center">Mục đích</TableHead>
                                        <TableHead className="text-center">Xu hướng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isSearching && searchedKeywords.length === 0 && debouncedFilterTerm ? (
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
                                                    <Badge variant={item.competition === "High" ? "destructive" : item.competition === "Medium" ? "secondary" : "outline"}>{item.competition}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center"><Badge variant="outline">{item.intent}</Badge></TableCell>
                                                <TableCell className="text-center">{item.trend === "True" ? <TrendingUp className="inline h-4 w-4 text-green-500" /> : <BarChart2 className="inline h-4 w-4 text-gray-500" />}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8">{debouncedFilterTerm ? 'No results found.' : 'Enter a keyword to start searching.'}</TableCell></TableRow>
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
                            <CardTitle>Thêm từ khóa để theo dõi</CardTitle>
                            <CardDescription>Nhập từ khóa bạn muốn theo dõi thứ hạng theo thời gian.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1">
                                    <Input placeholder="e.g., 'best seo tools'" value={newTrackingKeyword} onChange={(e) => setNewTrackingKeyword(e.target.value)} />
                                </div>
                                <Button onClick={handleAddTrackingClick} disabled={addTrackingMutation.isPending}>
                                    {addTrackingMutation.isPending ? "Adding..." : <><PlusCircle className="h-4 w-4 mr-2" /><span>Thêm</span></>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Theo dõi thứ hạng từ khóa</CardTitle>
                                    <CardDescription>Vị trí các từ khóa bạn đang theo dõi.</CardDescription>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleUpdateRankClick}
                                    disabled={updateRankMutation.isPending}
                                >
                                    {updateRankMutation.isPending ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    <span className="ml-2">Cập nhật</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingRankings ? <div className="text-center p-12">Loading...</div> :
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Từ khóa</TableHead>
                                            <TableHead className="text-center">Thứ hạng hiện tại</TableHead>
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
