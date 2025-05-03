import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const COLORS = ['#3f51b5', '#2196f3', '#ff4081', '#4caf50', '#ff9800'];

export default function Reports() {
  const [reportType, setReportType] = useState("client-activity");
  const [timeRange, setTimeRange] = useState("last30");
  
  // Fetch report data based on selected type and time range
  const { data, isLoading } = useQuery({
    queryKey: ['/api/reports', { type: reportType, timeRange }],
  });
  
  const reportData = data?.data || [];
  
  const exportReport = async () => {
    try {
      const response = await fetch(`/api/reports/export?type=${reportType}&timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-neutral-200 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-neutral-500">Reports</CardTitle>
            <div className="flex items-center">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px] mr-2 h-9">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-activity">Client Activity</SelectItem>
                  <SelectItem value="task-completion">Task Completion</SelectItem>
                  <SelectItem value="client-distribution">Client Distribution</SelectItem>
                  <SelectItem value="compliance-score">Compliance Score</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] mr-2 h-9">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-primary border-primary"
                onClick={exportReport}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <>
                  {/* Different chart types based on report type */}
                  {(reportType === "client-activity" || reportType === "task-completion") && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3f51b5" name={reportType === "client-activity" ? "Activities" : "Tasks"} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {reportType === "client-distribution" && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {reportData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  {reportType === "compliance-score" && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#4caf50" name="Compliance Score %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="summary">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Report Summary</h3>
                
                {isLoading ? (
                  <p>Loading summary data...</p>
                ) : (
                  <>
                    {reportType === "client-activity" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Total activities in this period: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Most active day: {
                            reportData.length > 0 
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Average activities per day: {
                            reportData.length > 0
                              ? (reportData.reduce((sum: number, item: any) => sum + item.value, 0) / reportData.length).toFixed(2)
                              : '0'
                          }
                        </p>
                      </div>
                    )}
                    
                    {reportType === "task-completion" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Total tasks completed: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Most productive day: {
                            reportData.length > 0 
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Average completion rate: {
                            data?.metadata?.completionRate 
                              ? `${data.metadata.completionRate}%`
                              : 'N/A'
                          }
                        </p>
                      </div>
                    )}
                    
                    {reportType === "client-distribution" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Total clients: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Most common industry: {
                            reportData.length > 0 
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Industry diversity: {reportData.length} industries represented
                        </p>
                      </div>
                    )}
                    
                    {reportType === "compliance-score" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Average compliance score: {
                            reportData.length > 0
                              ? `${(reportData.reduce((sum: number, item: any) => sum + item.value, 0) / reportData.length).toFixed(2)}%`
                              : '0%'
                          }
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Lowest compliance area: {
                            reportData.length > 0 
                              ? reportData.reduce((min: any, item: any) => (item.value < min.value ? item : min), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Areas needing attention: {
                            reportData.filter((item: any) => item.value < 80).length
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
