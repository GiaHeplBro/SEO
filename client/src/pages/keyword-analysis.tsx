import { Search, Rocket, TrendingUp, BarChart2, Download, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import api from "@/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  keyword1: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  trend: string;
  intent: string;
  rank: number;
}

interface RankTrackingItem {
  id: number;
  userId: number;
  keyword: string;
  rank: number;
}

const fetchAllKeywords = async (): Promise<Keyword[]> => {
  const { data } = await api.get("/Keywords");
  return Array.isArray(data) ? data : [];
};

const searchKeywordsApi = async (keyword: string): Promise<Keyword[]> => {
  if (!keyword) return [];
  const { data } = await api.get(`/Keywords/search/${keyword}`);
  return Array.isArray(data) ? data : [];
};

const generateKeywordsApi = async (inputKeyword: string): Promise<any> => {
  const { data } = await api.post("/Keywords/search", { input_keyword: inputKeyword });
  return data;
};

const fetchRankTrackings = async (): Promise<RankTrackingItem[]> => {
  const { data } = await api.get("/RankTrackings");
  return Array.isArray(data) ? data : [];
};

export default function KeywordAnalysis() {
  const [filterTerm, setFilterTerm] = useState("");
  const [aiSeedKeyword, setAiSeedKeyword] = useState("");
  const debouncedFilterTerm = useDebounce(filterTerm, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allKeywords, isLoading: isLoadingAll } = useQuery({
    queryKey: ['keywords'],
    queryFn: fetchAllKeywords,
  });

  const { data: searchedKeywords, isFetching: isSearching } = useQuery({
    queryKey: ['keywordsSearch', debouncedFilterTerm],
    queryFn: () => searchKeywordsApi(debouncedFilterTerm),
    enabled: !!debouncedFilterTerm,
  });

  const { data: rankTrackings, isLoading: isLoadingRankings } = useQuery({
    queryKey: ['rankTrackings'],
    queryFn: fetchRankTrackings,
  });

  const generationMutation = useMutation({
    mutationFn: generateKeywordsApi,
    onSuccess: () => {
      toast({ title: "Thành công!", description: "Đã tạo và thêm các từ khóa mới." });
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
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

  const displayData = debouncedFilterTerm ? searchedKeywords : allKeywords;

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
            <CardHeader className="pb-2">
              <CardTitle>Search Your Keywords</CardTitle>
              <CardDescription>Filter your existing keyword list.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Filter by keyword..."
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Keyword Analysis Results</CardTitle>
              <CardDescription>
                {isSearching ? `Searching for "${debouncedFilterTerm}"...` : `Showing ${displayData?.length || 0} keywords.`}
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
                  {isLoadingAll ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">Loading initial data...</TableCell></TableRow>
                  ) : (
                    displayData?.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.keyword1}</TableCell>
                        <TableCell className="text-center">{item.searchVolume.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                              <div
                                className={`h-full rounded-full ${item.difficulty > 70 ? "bg-red-500" :
                                  item.difficulty > 50 ? "bg-yellow-500" : "bg-green-500"
                                  }`}
                                style={{ width: `${item.difficulty}%` }}
                              />
                            </div>
                            <span>{item.difficulty}</span>
                          </div>
                        </TableCell>                        <TableCell className="text-center">${item.cpc}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={
                            item.competition === "High" ? "destructive" :
                              item.competition === "Medium" ? "secondary" : "outline"
                          }>
                            {item.competition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center"><Badge variant="outline">{item.intent}</Badge></TableCell>
                        <TableCell className="text-center">{item.trend === "True" ? <TrendingUp className="inline h-4 w-4 text-green-500" /> : <BarChart2 className="inline h-4 w-4 text-yellow-500" />}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rank Tracking</CardTitle>
              <CardDescription>Monitor your keyword positions over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRankings ? (
                <div className="text-center p-12">Đang tải dữ liệu...</div>
              ) : rankTrackings && rankTrackings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Current Rank</TableHead>
                      <TableHead className="text-center">User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankTrackings.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.keyword}</TableCell>
                        <TableCell className="text-center"><Badge>{item.rank}</Badge></TableCell>
                        <TableCell className="text-center">{item.userId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-12">
                  <BarChart2 className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No tracked keywords yet</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Start tracking keywords to see their ranking progress over time.
                  </p>
                  <Button className="mt-4">Add Keywords to Track</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}