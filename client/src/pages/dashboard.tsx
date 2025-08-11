import { useState } from "react";
import { useQuery } from '@tanstack/react-query'; // Thêm import
import axios from 'axios'; // Import axios
import api from '@/axiosInstance'; // Thêm import

import {
  BarChart,
  TrendingUp,
  Search,
  FileText,
  Globe,
  Link,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface TopRankingKeyword {
  keyword_name: string;
  rank: number;
  search_volume: number;
}

interface KeywordData {
  id: number;
  keywordName: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  // Giả sử có thêm trường 'change'
  change?: number;
}

const fetchKeywords = async (): Promise<KeywordData[]> => {
  // Giả định API của trang Keyword Analysis là /Keywords
  const { data } = await api.get('/Keywords');
  return data;
};

const fetchTopRankings = async (): Promise<TopRankingKeyword[]> => {
  const response = await axios.post('https://seo-flask-api.azurewebsites.net/top-ranking');
  // API trả về object có chứa mảng "items"
  return response.data.items || [];
};


// Mock data for dashboard
const websitePerformance = {
  score: 72,
  change: "+6%",
  trend: "up",
};

const keywordPerformance = [
  {
    keyword: "content optimization",
    position: 4,
    change: 2,
    searchVolume: 8500,
  },
  {
    keyword: "seo tools online",
    position: 7,
    change: 3,
    searchVolume: 12300,
  },
  {
    keyword: "keyword research",
    position: 9,
    change: -1,
    searchVolume: 22800,
  },
  {
    keyword: "on page seo",
    position: 12,
    change: 4,
    searchVolume: 6700,
  },
  {
    keyword: "seo optimization platform",
    position: 2,
    change: 5,
    searchVolume: 3200,
  },
];

const recentAudits = [
  {
    url: "https://example.com/blog",
    score: 85,
    issues: 4,
    date: "Today",
  },
  {
    url: "https://example.com/services",
    score: 68,
    issues: 12,
    date: "Yesterday",
  },
  {
    url: "https://example.com/about",
    score: 92,
    issues: 1,
    date: "May 12, 2023",
  },
];

const seoAlerts = [
  {
    type: "critical",
    message: "5 pages with missing meta descriptions",
    date: "2 hours ago",
  },
  {
    type: "warning",
    message: "Organic traffic decreased by 5% this week",
    date: "1 day ago",
  },
  {
    type: "info",
    message: "Google updated its core algorithm",
    date: "3 days ago",
  },
];

export default function Dashboard() {
  const [searchUrl, setSearchUrl] = useState("");

  const {
    data: topKeywords,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['topRankings'], // Đặt một key mới cho query này
    queryFn: fetchTopRankings, // Gọi hàm mới
  });

  // Dữ liệu giả cho các phần khác của dashboard (bạn có thể thay thế sau)
  const websitePerformance = { score: 72, change: "+6%", trend: "up" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Trang chủ</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Tổng quan về hiệu suất SEO và các cơ hội tối ưu hóa của bạn
        </p>
      </div>

      {/* Quick Analysis Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-sm">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Phân tích Website nhanh
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Nhập bất kỳ URL nào để nhận ngay phân tích SEO và đề xuất tối ưu hóa
              </p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="https://example.com"
                    value={searchUrl}
                    onChange={(e) => setSearchUrl(e.target.value)}
                  />
                </div>
                <Button>Phân tích</Button>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">25k+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Từ khóa được theo dõi
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">150+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Trang web được phân tích
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tỷ lệ thành công
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm Website</CardTitle>
            <div
              className={`${websitePerformance.trend === "up" ? "text-green-600" : "text-red-600"} flex items-center text-xs font-medium`}
            >
              {websitePerformance.trend === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-1 text-red-600 transform rotate-180" />
              )}
              {websitePerformance.change}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative pt-2">
              <div className="text-3xl font-bold">
                {websitePerformance.score}/100
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Hiệu suất Website

              </div>
              <Progress value={websitePerformance.score} className="h-2 mt-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Từ khóa trong Top 10
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+3 từ khóa</span>{" "}
              kể từ tháng trước
            </div>
            <Progress value={24} max={50} className="h-2 mt-3" />
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backlinks</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,417</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+89 links</span> since last month
            </div>
            <Progress value={72} className="h-2 mt-3" />
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm nội dung</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78/100</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12 điểm</span>{" "}
              với tối ưu hóa AI
            </div>
            <Progress value={78} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keywords">Xếp hạng từ khóa</TabsTrigger>
          {/* <TabsTrigger value="audits">Recent Audits</TabsTrigger>
          <TabsTrigger value="alerts">SEO Alerts</TabsTrigger> */}
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Xếp hạng từ khóa hàng đầu</CardTitle>
                  <CardDescription>
                    Hiệu suất của các từ khóa hàng đầu của bạn trong kết quả tìm kiếm
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BarChart className="h-4 w-4" />
                  <span>View All</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Từ khóa</TableHead>
                    <TableHead className="text-center">Xếp hạng</TableHead>
                    <TableHead className="text-center">Khối lượng tìm kiếm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* SỬA Ở ĐÂY 4: Cập nhật logic hiển thị bảng */}
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">Loading top keywords...</TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-red-500">Failed to load data.</TableCell>
                    </TableRow>
                  ) : (
                    topKeywords?.map((keyword, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {keyword.keyword_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              keyword.rank <= 3
                                ? "default"
                                : keyword.rank <= 10
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {keyword.rank}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {keyword.search_volume.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Website Audits</CardTitle>
                  <CardDescription>
                    Results from your most recent SEO audits
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All Audits
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {recentAudits.map((audit, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="truncate mr-2">
                          {audit.url.replace("https://", "")}
                        </span>
                        <Badge
                          variant={
                            audit.score > 80
                              ? "outline"
                              : audit.score > 60
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            audit.score > 80
                              ? "bg-green-50 text-green-700 border-green-200"
                              : ""
                          }
                        >
                          {audit.score}/100
                        </Badge>
                      </CardTitle>
                      <CardDescription>{audit.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Issues detected:</span>
                          <span
                            className={
                              audit.issues > 5
                                ? "text-amber-600 font-medium"
                                : "font-medium"
                            }
                          >
                            {audit.issues}{" "}
                            {audit.issues === 1 ? "issue" : "issues"}
                          </span>
                        </div>
                        <Progress
                          value={100 - audit.issues * 5}
                          className="h-1.5"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>SEO Alerts & Notifications</CardTitle>
                  <CardDescription>
                    Important updates and issues that need your attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-3 border rounded-lg"
                  >
                    <div
                      className={`
                      p-2 rounded-full flex-shrink-0
                      ${
                        alert.type === "critical"
                          ? "bg-red-100"
                          : alert.type === "warning"
                            ? "bg-amber-100"
                            : "bg-blue-100"
                      }
                    `}
                    >
                      {alert.type === "critical" ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : alert.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      ) : (
                        <Globe className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-medium ${
                            alert.type === "critical"
                              ? "text-red-900"
                              : alert.type === "warning"
                                ? "text-amber-900"
                                : "text-blue-900"
                          }`}
                        >
                          {alert.type === "critical"
                            ? "Critical Issue"
                            : alert.type === "warning"
                              ? "Warning"
                              : "Information"}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {alert.date}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing 3 of 12 alerts
              </div>
              <Button variant="ghost" size="sm">
                View All Alerts
              </Button>
            </CardFooter>
          </Card>
        </TabsContent> */}
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cơ hội tối ưu hóa</CardTitle>
              <Badge className="bg-blue-50 border-blue-200 text-blue-700">
                + 4
              </Badge>
            </div>
            <CardDescription>
              Những thao tác nhanh chóng để cải thiện hiệu suất SEO của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Tối ưu hóa thẻ tiêu đề trên 7 trang wed",
                "Sửa 12 liên kết nội bộ bị hỏng",
                "Cải thiện tốc độ tải trang trên thiết bị di động",
                "Thêm đánh dấu lược đồ vào trang sản phẩm",
              ].map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded mr-3">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>{suggestion}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Opportunities
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đề xuất nội dung AI</CardTitle>
            <CardDescription>
              Ý tưởng nội dung hỗ trợ AI để cải thiện thứ hạng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Tạo các hướng dẫn toàn diện về 'Các phương pháp hay nhất về SEO'",
                "Thêm chi tiết vào bài viết của bạn về 'nghiên cứu từ khóa",
                "Cải thiện khả năng đọc nội dung trên trang dịch vụ của bạn",
                "Cập nhật bài đăng trên blog của bạn về 'Cập nhật thuật toán Google'",
              ].map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-50 p-2 rounded mr-3">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>{suggestion}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Generate
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Get More AI Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
