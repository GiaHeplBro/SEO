import { useState } from "react";
import { Globe, Search, ArrowUpRight, CheckCircle, XCircle, AlertCircle, Clock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock data for SEO audit
const auditResults = {
  performance: 78,
  issues: {
    critical: 4,
    important: 7,
    opportunities: 12,
    passed: 24
  },
  categories: [
    {
      name: "On-Page SEO",
      score: 82,
      items: [
        { name: "Title Tag", status: "pass", details: "Title tag is well-optimized with primary keywords." },
        { name: "Meta Description", status: "warning", details: "Meta description is too short (85 characters). Aim for 150-160 characters." },
        { name: "Heading Structure", status: "pass", details: "Heading structure is well-organized with proper H1-H6 hierarchy." },
        { name: "Content Length", status: "pass", details: "Content length is good (1520 words)." },
        { name: "Keyword Density", status: "warning", details: "Primary keyword density is too high (5.2%). Aim for 1-2%." }
      ]
    },
    {
      name: "Technical SEO",
      score: 65,
      items: [
        { name: "Mobile Friendliness", status: "pass", details: "Page is mobile-friendly according to testing." },
        { name: "Page Speed", status: "error", details: "Page loads slowly (5.2s). Aim for under 3 seconds." },
        { name: "HTTPS", status: "pass", details: "Site is secure with valid HTTPS certificate." },
        { name: "Schema Markup", status: "error", details: "No schema markup detected. Add relevant schema for rich snippets." },
        { name: "XML Sitemap", status: "warning", details: "XML sitemap exists but contains errors." }
      ]
    },
    {
      name: "Content Quality",
      score: 88,
      items: [
        { name: "Readability", status: "pass", details: "Content has good readability score (Grade level: 7)." },
        { name: "Duplicate Content", status: "pass", details: "No duplicate content issues detected." },
        { name: "Grammar & Spelling", status: "warning", details: "Minor grammar issues detected. Consider proofreading." },
        { name: "Content Structure", status: "pass", details: "Good use of subheadings, lists, and paragraphs." },
        { name: "Image Optimization", status: "pass", details: "Images include descriptive filenames and alt text." }
      ]
    },
    {
      name: "Backlink Profile",
      score: 72,
      items: [
        { name: "Backlink Quality", status: "warning", details: "Some low-quality backlinks detected. Consider disavowing." },
        { name: "Referring Domains", status: "pass", details: "Good diversity of referring domains (76 domains)." },
        { name: "Anchor Text", status: "pass", details: "Natural anchor text distribution." },
        { name: "Toxic Backlinks", status: "warning", details: "12 potentially toxic backlinks detected." },
        { name: "Social Signals", status: "error", details: "Low social media engagement. Increase social sharing." }
      ]
    }
  ]
};

export default function SeoAudit() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true); // Set to true to display mock results
  
  const handleAnalyze = () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">SEO Audit</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Comprehensive analysis of your website's SEO health and performance
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Analyze Website</CardTitle>
          <CardDescription>Enter a URL to perform a comprehensive SEO audit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="https://example.com"
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
          <Card className="border-none shadow-none bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <Progress
                      value={auditResults.performance}
                      className="w-36 h-36 [transform:rotate(-90deg)] absolute [&>div]:stroke-blue-600"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold">{auditResults.performance}</span>
                        <span className="text-xl">/100</span>
                        <p className="text-sm mt-1">Overall Score</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 md:col-span-3">
                  <Card className="border border-red-100">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Critical Issues</p>
                        <p className="text-xl font-bold">{auditResults.issues.critical}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-amber-100">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-amber-100 rounded-full p-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Warnings</p>
                        <p className="text-xl font-bold">{auditResults.issues.important}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-blue-100">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Opportunities</p>
                        <p className="text-xl font-bold">{auditResults.issues.opportunities}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-green-100">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Passed</p>
                        <p className="text-xl font-bold">{auditResults.issues.passed}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="on-page" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="on-page">On-Page SEO</TabsTrigger>
              <TabsTrigger value="technical">Technical SEO</TabsTrigger>
              <TabsTrigger value="content">Content Quality</TabsTrigger>
              <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
            </TabsList>
            
            {auditResults.categories.map((category, index) => (
              <TabsContent key={index} value={category.name.toLowerCase().replace(' ', '-')}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <CardDescription>Score: {category.score}/100</CardDescription>
                      </div>
                      <Progress value={category.score} className="w-[100px]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center space-x-2 text-left">
                              {item.status === "pass" ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : item.status === "warning" ? (
                                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                              <span>{item.name}</span>
                              <Badge 
                                className="ml-2" 
                                variant={
                                  item.status === "pass" ? "outline" :
                                  item.status === "warning" ? "warning" : "destructive"
                                }
                              >
                                {item.status === "pass" ? "Passed" : 
                                  item.status === "warning" ? "Warning" : "Failed"}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-7">
                            <p className="text-gray-600 dark:text-gray-400">{item.details}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="flex justify-between space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>View Detailed Report</span>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export PDF Report</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}