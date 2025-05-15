import { useState } from "react";
import { Globe, Search, Check, Info, AlertTriangle, Code, FileText, Edit, Heading1, Heading2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";

// Mock data for on-page elements
const pageElements = [
  {
    type: "title",
    current: "Best SEO Strategies for 2023 | Increase Traffic & Rankings",
    status: "good",
    recommendation: "Good length and includes target keywords. Consider moving main keyword closer to the beginning.",
    importance: 90
  },
  {
    type: "meta_description",
    current: "Learn the best SEO strategies for 2023. Our guide covers technical, on-page, and off-page tactics to boost your rankings and increase organic traffic.",
    status: "good",
    recommendation: "Good length and includes target keywords with a clear call to action.",
    importance: 85
  },
  {
    type: "h1",
    current: "The Ultimate Guide to SEO Strategies for 2023",
    status: "good",
    recommendation: "Good H1 that includes main keyword. Clear and concise.",
    importance: 80
  },
  {
    type: "url",
    current: "https://example.com/seo-strategies-for-2023",
    status: "good",
    recommendation: "Clean URL structure with target keyword included.",
    importance: 75
  },
  {
    type: "content_length",
    current: "1250 words",
    status: "warning",
    recommendation: "Content is a bit short for this topic. Aim for 2000+ words to cover the topic comprehensively.",
    importance: 70
  },
  {
    type: "keyword_density",
    current: "Primary: 2.8%, Secondary: 1.5%",
    status: "warning",
    recommendation: "Primary keyword density is slightly high. Aim for 1.5-2.5% for optimal results.",
    importance: 65
  },
  {
    type: "h2_tags",
    current: "5 H2 tags (3 contain target keywords)",
    status: "good",
    recommendation: "Good structure with keywords in most H2s. Consider adding keywords to all H2s where relevant.",
    importance: 65
  },
  {
    type: "images",
    current: "4 images (2 missing alt text)",
    status: "error",
    recommendation: "Add descriptive alt text with keywords to all images for better accessibility and SEO.",
    importance: 60
  },
  {
    type: "internal_links",
    current: "7 internal links",
    status: "good",
    recommendation: "Good number of internal links. Consider adding 2-3 more to relevant content.",
    importance: 60
  },
  {
    type: "external_links",
    current: "2 external links",
    status: "warning",
    recommendation: "Add more high-quality external links to authoritative sources to increase credibility.",
    importance: 55
  }
];

// Content optimization suggestions
const contentSuggestions = [
  "Add more comprehensive sections on technical SEO practices",
  "Include case studies or success stories with real metrics",
  "Expand the section on mobile SEO optimization",
  "Add a FAQ section addressing common SEO questions",
  "Include more visual content like infographics",
  "Add section on local SEO strategies for businesses"
];

export default function OnPageOptimization() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true); // Show mock results by default
  const [activeTab, setActiveTab] = useState("elements");
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const [optimizedText, setOptimizedText] = useState<Record<string, string>>({
    title: pageElements[0].current,
    meta_description: pageElements[1].current,
    h1: pageElements[2].current
  });
  
  const handleAnalyze = () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <Check className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <Info className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getElementIcon = (type: string) => {
    switch (type) {
      case "title":
        return <FileText className="h-5 w-5" />;
      case "meta_description":
        return <FileText className="h-5 w-5" />;
      case "h1":
        return <Heading1 className="h-5 w-5" />;
      case "h2_tags":
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
          <CardTitle>Analyze Page</CardTitle>
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
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-spin">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
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
          <Tabs defaultValue="elements" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="elements">On-Page Elements</TabsTrigger>
              <TabsTrigger value="content">Content Optimization</TabsTrigger>
              <TabsTrigger value="preview">SERP Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="elements" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>On-Page SEO Elements</CardTitle>
                  <CardDescription>Analyze and optimize your page elements for better search visibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Element</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead className="w-[100px] text-center">Status</TableHead>
                        <TableHead className="w-[100px] text-center">Importance</TableHead>
                        <TableHead className="w-[100px] text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageElements.map((element, index) => (
                        <>
                          <TableRow key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell className="font-medium flex items-center gap-2">
                              {getElementIcon(element.type)}
                              <span>{element.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">{element.current}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                {getStatusIcon(element.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Progress 
                                  value={element.importance} 
                                  className="w-14 h-2"
                                  indicatorClassName={
                                    element.importance > 80 ? "bg-blue-600" : 
                                    element.importance > 60 ? "bg-green-500" : "bg-amber-500"
                                  }
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setExpandedElement(expandedElement === element.type ? null : element.type)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedElement === element.type && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-gray-50 dark:bg-gray-800 p-4">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-1">Recommendation:</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{element.recommendation}</p>
                                  </div>
                                  
                                  {(element.type === "title" || element.type === "meta_description" || element.type === "h1") && (
                                    <div className="space-y-2">
                                      <Label htmlFor={`optimized-${element.type}`}>Optimized Version:</Label>
                                      <Textarea 
                                        id={`optimized-${element.type}`} 
                                        value={optimizedText[element.type]}
                                        onChange={(e) => setOptimizedText({...optimizedText, [element.type]: e.target.value})}
                                        className="min-h-[80px]"
                                      />
                                      <div className="flex justify-end">
                                        <Button size="sm">Apply Changes</Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Optimization</CardTitle>
                  <CardDescription>AI-powered suggestions to improve your content for better rankings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Content Quality Score</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">72/100</Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Comprehensiveness</Label>
                          <span className="text-sm">68/100</span>
                        </div>
                        <Slider defaultValue={[68]} max={100} step={1} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Readability</Label>
                          <span className="text-sm">85/100</span>
                        </div>
                        <Slider defaultValue={[85]} max={100} step={1} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Keyword Usage</Label>
                          <span className="text-sm">76/100</span>
                        </div>
                        <Slider defaultValue={[76]} max={100} step={1} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Structure</Label>
                          <span className="text-sm">72/100</span>
                        </div>
                        <Slider defaultValue={[72]} max={100} step={1} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Content Improvement Suggestions</h3>
                    <div className="space-y-2">
                      {contentSuggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button className="ml-auto">Generate Optimized Content</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SERP Preview</CardTitle>
                  <CardDescription>See how your page appears in search results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 space-y-1 max-w-2xl">
                    <h3 className="text-xl text-blue-600 font-medium">{optimizedText.title || pageElements[0].current}</h3>
                    <p className="text-green-700 text-sm">https://example.com/seo-strategies-for-2023</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{optimizedText.meta_description || pageElements[1].current}</p>
                    
                    <div className="mt-4 text-sm space-y-2">
                      <p className="text-gray-500">Rating: ★★★★☆ (124 reviews)</p>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>May 15, 2023</span>
                        <span>•</span>
                        <span>6 min read</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Click-Through Rate Estimate:</span> 4.2% (Above average)
                  </div>
                  <Button variant="outline">Update Preview</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}