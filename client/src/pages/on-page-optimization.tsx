import { useState, useEffect } from "react";
import { Globe, Search, Check, Info, AlertTriangle, Code, FileText, Edit, Heading1, Heading2, Image, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "@/axiosInstance"; // Import axiosInstance của bạn
import React from "react";

// Định nghĩa kiểu dữ liệu cho Element từ API của bạn
interface Element {
  id: number;
  url: string;
  element1: string; // Tên của element (ví dụ: title, meta_description, h1, v.v.)
  currentValue: string; // Giá trị hiện tại của element
  status: "good" | "warning" | "error" | "diffent"; // Trạng thái của element
  important: number; // Mức độ quan trọng (từ 0 đến 100)
}

export default function OnPageOptimization() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false); // Ban đầu ẩn kết quả

  const [expandedElementId, setExpandedElementId] = useState<number | null>(null);
  
  // State cho dữ liệu từ API
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Mặc định 10 phần tử mỗi trang

  // State cho Optimized Text (chỉ áp dụng cho các trường có thể chỉnh sửa như title, meta, h1)
  const [optimizedText, setOptimizedText] = useState<Record<string, string>>({});
  const [newElement, setNewElement] = useState({
    url: "",
    element1: "",
    currentValue: "",
    status: "good",
    important: 50,
  });

  // --- API Functions ---
  const fetchElements = async (page: number = 1, size: number = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Elements/${page}/${size}`); // Sử dụng api.get
      const data = res.data;

      if (data && Array.isArray(data.items)) { // Kiểm tra data.items là mảng
        setElements(data.items);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);

        // Khởi tạo optimizedText với giá trị hiện tại từ API
        const initialOptimizedText: Record<string, string> = {};
        data.items.forEach((item: Element) => {
          if (item.element1 === "title" || item.element1 === "meta_description" || item.element1 === "h1") {
            initialOptimizedText[item.id.toString()] = item.currentValue;
          }
        });
        setOptimizedText(initialOptimizedText);
        setShowResults(true); // Hiển thị kết quả sau khi fetch thành công
      } else {
        console.error("API không trả về cấu trúc phân trang mong đợi hoặc items không phải mảng:", data);
        setError("Invalid API response structure.");
        setElements([]); // Đảm bảo elements là mảng rỗng nếu dữ liệu không hợp lệ
      }
    } catch (err: any) {
      setError(`Failed to fetch elements: ${err.message || err.response?.data || err}`);
      console.error("Lỗi khi gọi API Elements:", err);
      setElements([]); // Đảm bảo elements là mảng rỗng khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  const updateElement = async (id: number, updatedData: Partial<Element>) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/Elements/${id}`, updatedData); // Sử dụng api.put
      await fetchElements(currentPage, pageSize); // Cập nhật lại danh sách elements
    } catch (err: any) {
      setError(`Failed to update element: ${err.message || err.response?.data || err}`);
      console.error("Lỗi khi cập nhật element:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteElement = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/Elements/${id}`); // Sử dụng api.delete
      await fetchElements(currentPage, pageSize); // Cập nhật lại danh sách elements
    } catch (err: any) {
      setError(`Failed to delete element: ${err.message || err.response?.data || err}`);
      console.error("Lỗi khi xóa element:", err);
    } finally {
      setLoading(false);
    }
  };

  const createElement = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/Elements", newElement); // Sử dụng api.post
      await fetchElements(currentPage, pageSize); // Cập nhật lại danh sách elements
      setNewElement({ // Reset form
        url: "",
        element1: "",
        currentValue: "",
        status: "good",
        important: 50,
      });
    } catch (err: any) {
      setError(`Failed to create element: ${err.message || err.response?.data || err}`);
      console.error("Lỗi khi tạo element:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Tải dữ liệu ban đầu khi component mount
    fetchElements(currentPage, pageSize);
  }, [currentPage, pageSize]); // Tải lại khi trang hoặc kích thước trang thay đổi

  const handleAnalyze = () => {
    // Đây là nơi bạn sẽ tích hợp API phân tích URL của riêng mình sau này.
    // Hiện tại, nó chỉ đơn giản làm mới dữ liệu từ API Elements.
    if (!url) {
      alert("Vui lòng nhập URL để phân tích!");
      return;
    }
    setIsAnalyzing(true);
    // Simulate API call for analysis (replace with your actual analysis API call)
    setTimeout(() => {
      fetchElements(1, pageSize); // Tải lại dữ liệu sau khi "phân tích"
      setIsAnalyzing(false);
    }, 1000);
  };
  
  const handleApplyChanges = async (elementId: number) => {
    const updatedValue = optimizedText[elementId.toString()];
    if (updatedValue) {
      await updateElement(elementId, { currentValue: updatedValue });
      // Đóng phần mở rộng sau khi cập nhật
      setExpandedElementId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "good":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <Info className="h-5 w-5 text-red-500" />;
      case "diffent": // Trạng thái "diffent" từ API của bạn
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };
  
  const getElementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "title":
        return <FileText className="h-5 w-5" />;
      case "meta_description":
        return <FileText className="h-5 w-5" />;
      case "h1":
        return <Heading1 className="h-5 w-5" />;
      case "h2_tags":
      case "h2": // Nếu API trả về "h2"
        return <Heading2 className="h-5 w-5" />;
      case "images":
        return <Image className="h-5 w-5" />;
      case "url":
        return <Globe className="h-5 w-5" />;
      default:
        return <Code className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">On-Page Optimization</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Optimize your page elements to improve search visibility and rankings
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Analyze Website</CardTitle>
          <CardDescription>Enter a URL to analyze on-page elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="https://example.com/page-to-optimize"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button 
              className="flex items-center gap-2" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || loading}
            >
              {isAnalyzing || loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Analyze</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showResults && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>On-Page SEO Elements</CardTitle>
                <CardDescription>Analyze and optimize your page elements for better search visibility</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add New Element
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Element</DialogTitle>
                    <DialogDescription>
                      Add a new on-page element to the analysis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="new-url"
                        value={newElement.url}
                        onChange={(e) => setNewElement({ ...newElement, url: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-element-type" className="text-right">
                        Element Type
                      </Label>
                      <Input
                        id="new-element-type"
                        value={newElement.element1}
                        onChange={(e) => setNewElement({ ...newElement, element1: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., title, h1, image_alt"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-current-value" className="text-right">
                        Current Value
                      </Label>
                      <Textarea
                        id="new-current-value"
                        value={newElement.currentValue}
                        onChange={(e) => setNewElement({ ...newElement, currentValue: e.target.value })}
                        className="col-span-3 min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-status" className="text-right">
                        Status
                      </Label>
                      <Select onValueChange={(value) => setNewElement({ ...newElement, status: value as "good" | "warning" | "error" | "diffent" })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="diffent">Different</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-importance" className="text-right">
                        Importance
                      </Label>
                      <Input
                        id="new-importance"
                        type="number"
                        value={newElement.important}
                        onChange={(e) => setNewElement({ ...newElement, important: parseInt(e.target.value) || 0 })}
                        className="col-span-3"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createElement} disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Add Element
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading elements...</div>}
              {error && <div className="text-center py-4 text-red-500">{error}</div>}
              {!loading && !error && elements.length === 0 && (
                <div className="text-center py-4 text-gray-500">No elements found. Try adding one!</div>
              )}
              {!loading && !error && elements.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Element</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead className="w-[100px] text-center">Status</TableHead>
                      <TableHead className="w-[100px] text-center">Importance</TableHead>
                      <TableHead className="w-[120px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {elements.map((element) => (
                      <React.Fragment key={element.id}>
                        <TableRow className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-medium flex items-center gap-2">
                            {getElementIcon(element.element1)}
                            <span>{element.element1.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{element.currentValue}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              {getStatusIcon(element.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Progress
                                value={element.important}
                                className={`w-14 h-2 ${ // Áp dụng fix indicatorClassName ở đây
                                  element.important > 80
                                    ? "[&>*]:bg-blue-600"
                                    : element.important > 60
                                    ? "[&>*]:bg-green-500"
                                    : "[&>*]:bg-amber-500"
                                }`}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedElementId(expandedElementId === element.id ? null : element.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the 
                                    <span className="font-bold"> {element.element1} </span> 
                                    element and remove its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteElement(element.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                        {expandedElementId === element.id && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-gray-50 dark:bg-gray-800 p-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-1">Recommendation:</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This element's status is "{element.status}". Consider optimizing its value.
                                  </p>
                                </div>
                                
                                {(element.element1 === "title" || element.element1 === "meta_description" || element.element1 === "h1") && (
                                  <div className="space-y-2">
                                    <Label htmlFor={`optimized-${element.id}`}>Optimized Version:</Label>
                                    <Textarea 
                                      id={`optimized-${element.id}`} 
                                      value={optimizedText[element.id.toString()] || element.currentValue}
                                      onChange={(e) => setOptimizedText({...optimizedText, [element.id.toString()]: e.target.value})}
                                      className="min-h-[80px]"
                                    />
                                    <div className="flex justify-end">
                                      <Button size="sm" onClick={() => handleApplyChanges(element.id)} disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Apply Changes
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
              {/* Pagination Controls */}
              {!loading && !error && elements.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages} ({totalItems} items)
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}