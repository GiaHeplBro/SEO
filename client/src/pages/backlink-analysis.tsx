import { useState } from "react";
import { Globe, Search, Link, ExternalLink, ArrowUpRight, Shield, Download, TrendingUp, BarChart2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for backlinks
const backlinkOverview = {
  totalBacklinks: 2458,
  referringDomains: 387,
  organicKeywords: 684,
  domainAuthority: 48,
  toxicBacklinks: 73,
  dofollow: 1832,
  nofollow: 626,
  newBacklinks: 87,
  lostBacklinks: 34,
};

const backlinkSummary = [
  {
    domain: "techcrunch.com",
    backlinks: 7,
    authority: 92,
    traffic: "3.2M",
    linking: "Article mention",
    toxic: false,
    anchor: "SEO optimization platform"
  },
  {
    domain: "searchenginejournal.com",
    backlinks: 5,
    authority: 88,
    traffic: "1.8M",
    linking: "Resource list",
    toxic: false,
    anchor: "AI SEO tools"
  },
  {
    domain: "ahrefs.com",
    backlinks: 3,
    authority: 90,
    traffic: "980K",
    linking: "Blog post",
    toxic: false,
    anchor: "SEOBoostAI"
  },
  {
    domain: "moz.com",
    backlinks: 2,
    authority: 91,
    traffic: "1.5M",
    linking: "Forum post",
    toxic: false,
    anchor: "SEO optimization"
  },
  {
    domain: "backlinko.com",
    backlinks: 4,
    authority: 85,
    traffic: "790K",
    linking: "Case study",
    toxic: false,
    anchor: "content optimization tool"
  },
  {
    domain: "semrush.com",
    backlinks: 3,
    authority: 89,
    traffic: "2.1M",
    linking: "Comparison post",
    toxic: false,
    anchor: "SEOBoostAI platform"
  },
  {
    domain: "low-quality-site.net",
    backlinks: 28,
    authority: 12,
    traffic: "2.5K",
    linking: "Sitewide footer",
    toxic: true,
    anchor: "cheap SEO tools click here"
  },
  {
    domain: "spammy-links.org",
    backlinks: 45,
    authority: 8,
    traffic: "1.2K",
    linking: "Sitewide sidebar",
    toxic: true,
    anchor: "best SEO tool discount"
  }
];

const competitorBacklinks = [
  {
    competitor: "competitor1.com",
    backlinks: 3245,
    referringDomains: 567,
    unique: 432,
    shared: 124
  },
  {
    competitor: "competitor2.com",
    backlinks: 2876,
    referringDomains: 489,
    unique: 387,
    shared: 124
  },
  {
    competitor: "competitor3.com",
    backlinks: 1543,
    referringDomains: 312,
    unique: 286,
    shared: 76
  }
];

export default function BacklinkAnalysis() {
  const [domain, setDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true); // Show mock results by default
  const [activeTab, setActiveTab] = useState("overview");
  const [toxicFilter, setToxicFilter] = useState("all");
  
  const handleAnalyze = () => {
    if (!domain) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };
  
  // Filter backlinks based on selected toxic filter
  const filteredBacklinks = backlinkSummary.filter(item => {
    if (toxicFilter === "all") return true;
    if (toxicFilter === "toxic") return item.toxic;
    if (toxicFilter === "healthy") return !item.toxic;
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Backlink Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Analyze your backlink profile and discover new link-building opportunities
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Analyze Domain</CardTitle>
          <CardDescription>Enter a domain to analyze its backlink profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
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
          <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="overview">Backlink Overview</TabsTrigger>
              <TabsTrigger value="backlinks">Backlink Analysis</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Backlinks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Domain Authority</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center justify-center my-2">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 45 * (backlinkOverview.domainAuthority / 100)} ${2 * Math.PI * 45 * (1 - backlinkOverview.domainAuthority / 100)}`}
                            strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-3xl font-bold">{backlinkOverview.domainAuthority}</span>
                            <span className="text-lg">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      <p>Moderately Strong</p>
                      <p>Top 22% of websites</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Backlink Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center justify-center py-4">
                      <div className="w-full h-24 bg-gray-50 dark:bg-gray-800 rounded-md flex items-end justify-between px-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div 
                              className="w-5 bg-blue-500 rounded-t-sm" 
                              style={{ 
                                height: `${Math.max(15, Math.random() * 80)}px`,
                                opacity: i > 9 ? 1 : 0.7
                              }}
                            />
                            <span className="text-xs mt-1">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-100 rounded-full p-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">New Backlinks</p>
                          <p className="text-lg font-medium">+{backlinkOverview.newBacklinks}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-red-100 rounded-full p-1">
                          <BarChart2 className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lost Backlinks</p>
                          <p className="text-lg font-medium">-{backlinkOverview.lostBacklinks}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Backlinks</p>
                        <p className="text-2xl font-medium">{backlinkOverview.totalBacklinks.toLocaleString()}</p>
                      </div>
                      <Link className="h-9 w-9 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Referring Domains</p>
                        <p className="text-2xl font-medium">{backlinkOverview.referringDomains.toLocaleString()}</p>
                      </div>
                      <Globe className="h-9 w-9 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Organic Keywords</p>
                        <p className="text-2xl font-medium">{backlinkOverview.organicKeywords.toLocaleString()}</p>
                      </div>
                      <Search className="h-9 w-9 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Toxic Backlinks</p>
                        <p className="text-2xl font-medium">{backlinkOverview.toxicBacklinks.toLocaleString()}</p>
                      </div>
                      <Shield className="h-9 w-9 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Link Attributes</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2 flex items-center">
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Follow vs Nofollow</h3>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-md h-8 flex overflow-hidden">
                        <div 
                          className="bg-blue-500 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(backlinkOverview.dofollow / (backlinkOverview.dofollow + backlinkOverview.nofollow)) * 100}%` }}
                        >
                          {Math.round((backlinkOverview.dofollow / (backlinkOverview.dofollow + backlinkOverview.nofollow)) * 100)}%
                        </div>
                        <div 
                          className="bg-gray-400 flex items-center justify-center text-white text-xs"
                          style={{ width: `${(backlinkOverview.nofollow / (backlinkOverview.dofollow + backlinkOverview.nofollow)) * 100}%` }}
                        >
                          {Math.round((backlinkOverview.nofollow / (backlinkOverview.dofollow + backlinkOverview.nofollow)) * 100)}%
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-sm inline-block mr-1"></span>
                          Dofollow ({backlinkOverview.dofollow.toLocaleString()})
                        </span>
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-gray-400 rounded-sm inline-block mr-1"></span>
                          Nofollow ({backlinkOverview.nofollow.toLocaleString()})
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Top Anchor Texts</h3>
                      <div className="space-y-2">
                        {["brand name", "seo tool", "website url", "content optimization", "click here"].map((anchor, i) => (
                          <div key={i} className="flex items-center">
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mr-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${80 - (i * 12)}%` }}></div>
                            </div>
                            <span className="text-xs min-w-[60px] text-right">{anchor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backlinks" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <CardTitle>Backlink Analysis</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={toxicFilter} onValueChange={setToxicFilter}>
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Filter" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Backlinks</SelectItem>
                          <SelectItem value="healthy">Healthy Only</SelectItem>
                          <SelectItem value="toxic">Toxic Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Domain</TableHead>
                        <TableHead className="text-center">Backlinks</TableHead>
                        <TableHead className="text-center">Authority</TableHead>
                        <TableHead className="text-center">Traffic</TableHead>
                        <TableHead>Linking From</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBacklinks.map((link, index) => (
                        <TableRow key={index} className={link.toxic ? "bg-red-50 dark:bg-red-900/10" : ""}>
                          <TableCell className="font-medium">{link.domain}</TableCell>
                          <TableCell className="text-center">{link.backlinks}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-8 h-2 bg-gray-200 rounded-full mr-1">
                                <div 
                                  className={`h-full rounded-full ${
                                    link.authority > 70 ? "bg-green-500" :
                                    link.authority > 40 ? "bg-blue-500" : "bg-amber-500"
                                  }`}
                                  style={{ width: `${link.authority}%` }}
                                />
                              </div>
                              <span>{link.authority}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{link.traffic}</TableCell>
                          <TableCell>{link.linking}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={link.toxic ? "destructive" : "outline"}
                              className={!link.toxic ? "bg-green-50 text-green-700 border-green-200" : ""}
                            >
                              {link.toxic ? "Toxic" : "Healthy"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal h-4 w-4">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <ExternalLink className="h-4 w-4" /> 
                                  <span>Visit Domain</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <ArrowUpRight className="h-4 w-4" /> 
                                  <span>Check Backlinks</span>
                                </DropdownMenuItem>
                                {link.toxic && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                      <Shield className="h-4 w-4" /> 
                                      <span>Disavow Link</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredBacklinks.length} out of {backlinkSummary.length} backlinks
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="competitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Backlink Analysis</CardTitle>
                  <CardDescription>Compare your backlink profile with competitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-around mb-8">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Your Domain</div>
                      <div className="text-2xl font-medium">{backlinkOverview.referringDomains}</div>
                      <div className="text-sm">Referring Domains</div>
                    </div>
                    <div className="text-xs text-muted-foreground">vs</div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Competitors Avg</div>
                      <div className="text-2xl font-medium">456</div>
                      <div className="text-sm">Referring Domains</div>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competitor</TableHead>
                        <TableHead className="text-center">Backlinks</TableHead>
                        <TableHead className="text-center">Referring Domains</TableHead>
                        <TableHead className="text-center">Unique Links</TableHead>
                        <TableHead className="text-center">Shared Links</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitorBacklinks.map((competitor, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{competitor.competitor}</TableCell>
                          <TableCell className="text-center">{competitor.backlinks.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{competitor.referringDomains.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{competitor.unique.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{competitor.shared.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <span className="sr-only">Details</span>
                              View Gap Analysis
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2"
                  >
                    <span>Add Competitor</span>
                  </Button>
                  <Button className="flex items-center space-x-2">
                    <span>Find Link Opportunities</span>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}