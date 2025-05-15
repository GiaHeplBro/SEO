import { useState } from "react";
import { Search, Rocket, TrendingUp, BarChart2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for keyword analysis
const keywordData = [
  { 
    keyword: "content optimization",
    volume: 8700,
    difficulty: 65,
    cpc: 2.85,
    competition: "High",
    trend: "up",
    intent: "commercial"
  },
  { 
    keyword: "keyword research tool",
    volume: 12500,
    difficulty: 75,
    cpc: 4.25,
    competition: "High",
    trend: "up",
    intent: "commercial"
  },
  { 
    keyword: "seo content strategy",
    volume: 6300,
    difficulty: 58,
    cpc: 3.15,
    competition: "Medium",
    trend: "up",
    intent: "informational"
  },
  { 
    keyword: "seo tools free",
    volume: 22800,
    difficulty: 80,
    cpc: 5.10,
    competition: "Very High",
    trend: "up",
    intent: "commercial"
  },
  { 
    keyword: "how to improve seo ranking",
    volume: 9600,
    difficulty: 48,
    cpc: 2.50,
    competition: "Medium",
    trend: "stable",
    intent: "informational"
  },
  { 
    keyword: "on page optimization techniques",
    volume: 5100,
    difficulty: 45,
    cpc: 2.75,
    competition: "Medium",
    trend: "up",
    intent: "informational"
  },
  { 
    keyword: "backlink analysis tool",
    volume: 4200,
    difficulty: 60,
    cpc: 3.80,
    competition: "High",
    trend: "stable",
    intent: "commercial"
  }
];

// Suggested keywords based on seed
const suggestedKeywords = [
  "ai content optimization",
  "optimize content for seo",
  "content optimization services",
  "content optimization software",
  "optimize content for search engines",
  "best content optimization tools"
];

export default function KeywordAnalysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("research");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Keyword Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Discover high-performing keywords to enhance your content strategy and SEO rankings
        </p>
      </div>

      <Tabs defaultValue="research" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="research">Keyword Research</TabsTrigger>
          <TabsTrigger value="suggestions">Keyword Suggestions</TabsTrigger>
          <TabsTrigger value="tracking">Rank Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Search Keywords</CardTitle>
              <CardDescription>Find keywords related to your business or content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Enter a keyword or phrase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  <span>Analyze</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Keyword Analysis Results</CardTitle>
              <CardDescription>Showing {keywordData.length} keywords related to "SEO optimization"</CardDescription>
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
                  {keywordData.map((item, index) => (
                    <TableRow key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{item.keyword}</TableCell>
                      <TableCell className="text-center">{item.volume.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                            <div 
                              className={`h-full rounded-full ${
                                item.difficulty > 70 ? "bg-red-500" :
                                item.difficulty > 50 ? "bg-yellow-500" : "bg-green-500"
                              }`}
                              style={{ width: `${item.difficulty}%` }}
                            />
                          </div>
                          <span>{item.difficulty}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">${item.cpc}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={
                          item.competition === "Very High" ? "destructive" :
                          item.competition === "High" ? "destructive" :
                          item.competition === "Medium" ? "secondary" : "outline"
                        } className={item.competition === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}>
                          {item.competition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.intent === "commercial" ? "default" : "outline"}>
                          {item.intent}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.trend === "up" ? 
                          <TrendingUp className="inline h-4 w-4 text-green-500" /> : 
                          <BarChart2 className="inline h-4 w-4 text-yellow-500" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
              <div className="text-xs text-muted-foreground">
                Data updated: May 15, 2023
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Suggestions</CardTitle>
              <CardDescription>AI-powered keyword suggestions based on your seed keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedKeywords.map((keyword, i) => (
                  <Card key={i} className="border">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">{keyword}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Volume</div>
                          <div className="font-medium">{(Math.random() * 10000).toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Difficulty</div>
                          <div className="font-medium">{(Math.random() * 100).toFixed(0)}/100</div>
                        </div>
                        <div>
                          <div className="text-gray-500">CPC</div>
                          <div className="font-medium">${(Math.random() * 5).toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rank Tracking</CardTitle>
              <CardDescription>Monitor your keyword positions over time</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No tracked keywords yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start tracking keywords to see their ranking progress over time
                </p>
                <Button className="mt-4">Add Keywords to Track</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}