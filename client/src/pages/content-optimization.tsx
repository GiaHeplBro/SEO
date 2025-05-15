import { useState } from "react";
import { Sparkles, FileText, Search, Wand2, BarChart2, ArrowRight, Clock, Download, Lightbulb, AlertCircle, PenLine, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export default function ContentOptimization() {
  const [content, setContent] = useState("");
  const [optimizedContent, setOptimizedContent] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [contentLength, setContentLength] = useState<number[]>([3]);
  const [seoOptimization, setSeoOptimization] = useState<number[]>([70]);
  const [readabilityPreference, setReadabilityPreference] = useState<number[]>([3]);
  const [useCitations, setUseCitations] = useState(true);
  const [activeTab, setActiveTab] = useState("optimize");
  const [showResultsTab, setShowResultsTab] = useState(false);
  
  // Mock scores for the content
  const contentScores = {
    seo: 83,
    readability: 76,
    engagement: 68,
    originality: 92
  };
  
  // Mock suggestions for content improvements
  const contentSuggestions = [
    {
      type: "seo",
      suggestion: "Add your primary keyword in the first paragraph to improve SEO relevance."
    },
    {
      type: "seo",
      suggestion: "Consider adding 2-3 more related keywords like 'content strategy' and 'SEO writing'."
    },
    {
      type: "readability",
      suggestion: "Some sentences are too long. Break them down into shorter ones for better readability."
    },
    {
      type: "structure",
      suggestion: "Add one more subheading to break up the large text section in the middle."
    },
    {
      type: "engagement",
      suggestion: "Include a question to engage readers, such as 'How is your content currently performing?'"
    }
  ];
  
  // Get Perplexity API key for the AI optimization
  const checkApiKeyAndOptimize = async () => {
    if (!content || !targetKeyword) return;
    
    // Check if we have the API key from environment variables
    try {
      setIsOptimizing(true);
      
      // This would be a real API call in production
      setTimeout(() => {
        // Simulate API response from Perplexity
        const aiOptimizedContent = `# Optimized Content: ${targetKeyword}

## Introduction
In today's digital landscape, ${targetKeyword} has become essential for businesses looking to improve their online presence. This comprehensive guide explores the most effective strategies and techniques to optimize your content for both search engines and readers.

## Why ${targetKeyword} Matters
Search engines constantly evolve their algorithms to deliver the most relevant content to users. By implementing proper ${targetKeyword} techniques, you can ensure your content meets these criteria while maintaining high quality for your audience.

## Key Strategies for Success
1. **Research Your Keywords Thoroughly**: Start with comprehensive keyword research to identify what your target audience is searching for.
2. **Optimize Your Content Structure**: Use proper headings, bullet points, and paragraphs to improve readability.
3. **Focus on Quality**: Create valuable, informative content that answers your audience's questions.
4. **Leverage AI Tools**: Use advanced tools like SEOBoostAI to analyze and improve your content.

## Measuring Your Results
After implementing ${targetKeyword} techniques, track your performance using analytics to see improvements in rankings, traffic, and engagement metrics.

## Conclusion
${targetKeyword} is an ongoing process that requires attention to detail and adaptability. By following these guidelines and staying current with industry trends, you can create content that ranks well and resonates with your audience.`;
        
        setOptimizedContent(aiOptimizedContent);
        setIsOptimizing(false);
        setShowResultsTab(true);
        setActiveTab("results");
      }, 3000);
      
    } catch (error) {
      console.error("Error optimizing content:", error);
      setIsOptimizing(false);
    }
  };
  
  const readabilityLevels = ["Elementary", "Basic", "Intermediate", "College", "Expert"];
  const contentLengthOptions = ["Short", "Medium", "Long", "Comprehensive", "In-depth"];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center">
          Content Optimization
          <Sparkles className="ml-2 h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          AI-powered content enhancement for better search rankings and engagement
        </p>
      </div>
      
      <Tabs defaultValue="optimize" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="optimize">Optimize Content</TabsTrigger>
          <TabsTrigger value="results" disabled={!showResultsTab}>Optimized Results</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!showResultsTab}>Content Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="optimize" className="space-y-4">
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
                  <Input
                    id="target-keyword"
                    placeholder="e.g., content optimization techniques"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content">Your Content</Label>
                  <span className="text-xs text-muted-foreground">
                    {content.length} characters
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Paste your content here or start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Optimization Settings</CardTitle>
              <CardDescription>Customize how you want your content to be optimized</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Content Length</Label>
                  <span className="text-sm font-medium">
                    {contentLengthOptions[contentLength[0] - 1]}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={contentLength}
                  onValueChange={setContentLength}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>SEO Optimization Level</Label>
                  <span className="text-sm font-medium">
                    {seoOptimization[0]}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={10}
                  value={seoOptimization}
                  onValueChange={setSeoOptimization}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Readability Level</Label>
                  <span className="text-sm font-medium">
                    {readabilityLevels[readabilityPreference[0] - 1]}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={readabilityPreference}
                  onValueChange={setReadabilityPreference}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Citations</Label>
                  <p className="text-sm text-muted-foreground">
                    Add high-quality citations to support claims
                  </p>
                </div>
                <Switch
                  checked={useCitations}
                  onCheckedChange={setUseCitations}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button
                className="ml-auto flex items-center gap-2"
                onClick={checkApiKeyAndOptimize}
                disabled={isOptimizing || !content || !targetKeyword}
              >
                {isOptimizing ? (
                  <>
                    <span className="animate-spin">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Optimize with AI</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>AI-Optimized Content</CardTitle>
                  <CardDescription>Content optimized for "{targetKeyword}"</CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  AI Enhanced
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800 whitespace-pre-wrap font-mono text-sm min-h-[400px]">
                {optimizedContent}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex flex-wrap gap-2 justify-end">
              <Button variant="outline" className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                <span>Edit Content</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Use This Content</span>
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * (contentScores.seo / 100)} ${2 * Math.PI * 45 * (1 - contentScores.seo / 100)}`}
                        strokeDashoffset={2 * Math.PI * 45 * 0.25}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-lg font-bold">{contentScores.seo}</div>
                    </div>
                  </div>
                  <h3 className="mt-2 font-medium">SEO Score</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * (contentScores.readability / 100)} ${2 * Math.PI * 45 * (1 - contentScores.readability / 100)}`}
                        strokeDashoffset={2 * Math.PI * 45 * 0.25}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-lg font-bold">{contentScores.readability}</div>
                    </div>
                  </div>
                  <h3 className="mt-2 font-medium">Readability</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * (contentScores.engagement / 100)} ${2 * Math.PI * 45 * (1 - contentScores.engagement / 100)}`}
                        strokeDashoffset={2 * Math.PI * 45 * 0.25}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-lg font-bold">{contentScores.engagement}</div>
                    </div>
                  </div>
                  <h3 className="mt-2 font-medium">Engagement</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * (contentScores.originality / 100)} ${2 * Math.PI * 45 * (1 - contentScores.originality / 100)}`}
                        strokeDashoffset={2 * Math.PI * 45 * 0.25}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-lg font-bold">{contentScores.originality}</div>
                    </div>
                  </div>
                  <h3 className="mt-2 font-medium">Originality</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>Detailed breakdown of content performance factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Keywords</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-50 dark:bg-gray-800 border">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">Primary Keyword</div>
                      <div className="font-medium">{targetKeyword}</div>
                      <div className="mt-2 text-xs text-blue-600 flex items-center">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Optimized
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800 border">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">Keyword Density</div>
                      <div className="font-medium">2.3%</div>
                      <div className="mt-2 text-xs text-green-600 flex items-center">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Optimal
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800 border">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">Related Keywords</div>
                      <div className="font-medium">14 keywords</div>
                      <div className="mt-2 text-xs text-green-600 flex items-center">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Good variety
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800 border">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-1">LSI Keywords</div>
                      <div className="font-medium">8 keywords</div>
                      <div className="mt-2 text-xs text-amber-600 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Add more
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Readability Metrics</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Reading Ease</Label>
                      <span className="text-sm font-medium">Good (72.5)</span>
                    </div>
                    <Progress value={72.5} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Grade Level</Label>
                      <span className="text-sm font-medium">Grade 7 (Optimal)</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Sentence Complexity</Label>
                      <span className="text-sm font-medium">Simple to Moderate</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Improvement Suggestions</h3>
                <div className="space-y-2">
                  {contentSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded border">
                      {suggestion.type === "seo" ? (
                        <Search className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      ) : suggestion.type === "readability" ? (
                        <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : suggestion.type === "engagement" ? (
                        <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-sm capitalize">{suggestion.type}</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Last updated: Just now</span>
              </div>
              
              <Button className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                <span>Detailed Report</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}