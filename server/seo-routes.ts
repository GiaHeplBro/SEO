import { Request, Response, NextFunction, Express } from "express";
import { z } from "zod";
import { Server } from "http";
import { db } from "../db";
import * as schema from "../shared/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Helper to handle async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Mock user for demo purposes - in a real app this would use authentication
const DEMO_USER = {
  id: 1,
  username: "demo_user",
  fullName: "Demo User",
  role: "admin"
};

// Websites API
class WebsiteAPI {
  /**
   * Get all websites
   */
  static async getWebsites(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchQuery = req.query.query as string;
    
    try {
      let query = db.select().from(schema.websites);
      
      // Apply search filter if provided
      if (searchQuery) {
        query = query.where(
          sql`${schema.websites.name} ILIKE ${`%${searchQuery}%`} OR ${schema.websites.url} ILIKE ${`%${searchQuery}%`}`
        );
      }
      
      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.websites)
        .execute();
      
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const results = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.websites.updatedAt))
        .execute();
      
      return res.json({
        websites: results,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting websites:", error);
      return res.status(500).json({ message: "Failed to fetch websites" });
    }
  }
  
  /**
   * Get website by ID
   */
  static async getWebsiteById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      const website = await db
        .select()
        .from(schema.websites)
        .where(eq(schema.websites.id, id))
        .execute();
      
      if (!website || website.length === 0) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      return res.json(website[0]);
    } catch (error) {
      console.error("Error getting website:", error);
      return res.status(500).json({ message: "Failed to fetch website" });
    }
  }
  
  /**
   * Create new website
   */
  static async createWebsite(req: Request, res: Response) {
    try {
      const websiteData = schema.insertWebsiteSchema.parse({
        ...req.body,
        userId: DEMO_USER.id
      });
      
      const newWebsite = await db
        .insert(schema.websites)
        .values(websiteData)
        .returning()
        .execute();
      
      return res.status(201).json(newWebsite[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating website:", error);
      return res.status(500).json({ message: "Failed to create website" });
    }
  }
  
  /**
   * Update website
   */
  static async updateWebsite(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      // First check if website exists
      const website = await db
        .select()
        .from(schema.websites)
        .where(eq(schema.websites.id, id))
        .execute();
      
      if (!website || website.length === 0) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      // Update the website
      const updatedWebsite = await db
        .update(schema.websites)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(schema.websites.id, id))
        .returning()
        .execute();
      
      return res.json(updatedWebsite[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating website:", error);
      return res.status(500).json({ message: "Failed to update website" });
    }
  }
  
  /**
   * Delete website
   */
  static async deleteWebsite(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      // First check if website exists
      const website = await db
        .select()
        .from(schema.websites)
        .where(eq(schema.websites.id, id))
        .execute();
      
      if (!website || website.length === 0) {
        return res.status(404).json({ message: "Website not found" });
      }
      
      // Delete the website
      await db
        .delete(schema.websites)
        .where(eq(schema.websites.id, id))
        .execute();
      
      return res.json({ success: true, message: "Website deleted successfully" });
    } catch (error) {
      console.error("Error deleting website:", error);
      return res.status(500).json({ message: "Failed to delete website" });
    }
  }
}

// SEO Audit API
class SEOAuditAPI {
  /**
   * Get audits for a website
   */
  static async getAudits(req: Request, res: Response) {
    const websiteId = parseInt(req.params.websiteId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    try {
      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.seoAudits)
        .where(eq(schema.seoAudits.websiteId, websiteId))
        .execute();
      
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const audits = await db
        .select()
        .from(schema.seoAudits)
        .where(eq(schema.seoAudits.websiteId, websiteId))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.seoAudits.auditDate))
        .execute();
      
      return res.json({
        audits,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting audits:", error);
      return res.status(500).json({ message: "Failed to fetch audits" });
    }
  }
  
  /**
   * Get audit by ID
   */
  static async getAuditById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      const audit = await db
        .select()
        .from(schema.seoAudits)
        .where(eq(schema.seoAudits.id, id))
        .execute();
      
      if (!audit || audit.length === 0) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      return res.json(audit[0]);
    } catch (error) {
      console.error("Error getting audit:", error);
      return res.status(500).json({ message: "Failed to fetch audit" });
    }
  }
  
  /**
   * Create new SEO audit
   */
  static async createAudit(req: Request, res: Response) {
    try {
      const auditData = {
        ...req.body,
        auditDate: new Date()
      };
      
      const newAudit = await db
        .insert(schema.seoAudits)
        .values(auditData)
        .returning()
        .execute();
      
      // Also update the website's last analyzed date and SEO score
      await db
        .update(schema.websites)
        .set({
          lastAnalyzedAt: new Date(),
          seoScore: auditData.overallScore,
          updatedAt: new Date()
        })
        .where(eq(schema.websites.id, auditData.websiteId))
        .execute();
      
      return res.status(201).json(newAudit[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating audit:", error);
      return res.status(500).json({ message: "Failed to create audit" });
    }
  }
}

// Keywords API
class KeywordAPI {
  /**
   * Get keywords for a website
   */
  static async getKeywords(req: Request, res: Response) {
    const websiteId = parseInt(req.params.websiteId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchQuery = req.query.query as string;
    
    try {
      let query = db
        .select()
        .from(schema.keywords)
        .where(eq(schema.keywords.websiteId, websiteId));
      
      // Apply search filter if provided
      if (searchQuery) {
        query = query.where(like(schema.keywords.keyword, `%${searchQuery}%`));
      }
      
      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.keywords)
        .where(eq(schema.keywords.websiteId, websiteId))
        .execute();
      
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const keywords = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.keywords.updatedAt))
        .execute();
      
      return res.json({
        keywords,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting keywords:", error);
      return res.status(500).json({ message: "Failed to fetch keywords" });
    }
  }
  
  /**
   * Add new keyword
   */
  static async addKeyword(req: Request, res: Response) {
    try {
      const keywordData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const newKeyword = await db
        .insert(schema.keywords)
        .values(keywordData)
        .returning()
        .execute();
      
      return res.status(201).json(newKeyword[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding keyword:", error);
      return res.status(500).json({ message: "Failed to add keyword" });
    }
  }
  
  /**
   * Update keyword data
   */
  static async updateKeyword(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      const keywordData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const updatedKeyword = await db
        .update(schema.keywords)
        .set(keywordData)
        .where(eq(schema.keywords.id, id))
        .returning()
        .execute();
      
      if (!updatedKeyword || updatedKeyword.length === 0) {
        return res.status(404).json({ message: "Keyword not found" });
      }
      
      return res.json(updatedKeyword[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating keyword:", error);
      return res.status(500).json({ message: "Failed to update keyword" });
    }
  }
  
  /**
   * Delete keyword
   */
  static async deleteKeyword(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      await db
        .delete(schema.keywords)
        .where(eq(schema.keywords.id, id))
        .execute();
      
      return res.json({ success: true, message: "Keyword deleted successfully" });
    } catch (error) {
      console.error("Error deleting keyword:", error);
      return res.status(500).json({ message: "Failed to delete keyword" });
    }
  }
}

// Content Optimization API
class ContentOptimizationAPI {
  /**
   * Get content optimizations
   */
  static async getContentOptimizations(req: Request, res: Response) {
    const websiteId = parseInt(req.params.websiteId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    try {
      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.contentOptimizations)
        .where(eq(schema.contentOptimizations.websiteId, websiteId))
        .execute();
      
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const optimizations = await db
        .select()
        .from(schema.contentOptimizations)
        .where(eq(schema.contentOptimizations.websiteId, websiteId))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.contentOptimizations.optimizationDate))
        .execute();
      
      return res.json({
        optimizations,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting content optimizations:", error);
      return res.status(500).json({ message: "Failed to fetch content optimizations" });
    }
  }
  
  /**
   * Get content optimization by ID
   */
  static async getContentOptimizationById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    try {
      const optimization = await db
        .select()
        .from(schema.contentOptimizations)
        .where(eq(schema.contentOptimizations.id, id))
        .execute();
      
      if (!optimization || optimization.length === 0) {
        return res.status(404).json({ message: "Content optimization not found" });
      }
      
      return res.json(optimization[0]);
    } catch (error) {
      console.error("Error getting content optimization:", error);
      return res.status(500).json({ message: "Failed to fetch content optimization" });
    }
  }
  
  /**
   * Create new content optimization
   */
  static async createContentOptimization(req: Request, res: Response) {
    try {
      const optimizationData = {
        ...req.body,
        optimizationDate: new Date()
      };
      
      const newOptimization = await db
        .insert(schema.contentOptimizations)
        .values(optimizationData)
        .returning()
        .execute();
      
      return res.status(201).json(newOptimization[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating content optimization:", error);
      return res.status(500).json({ message: "Failed to create content optimization" });
    }
  }
}

// Backlinks API
class BacklinkAPI {
  /**
   * Get backlinks for a website
   */
  static async getBacklinks(req: Request, res: Response) {
    const websiteId = parseInt(req.params.websiteId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const showToxic = req.query.toxic === 'true';
    
    try {
      let query = db
        .select()
        .from(schema.backlinks)
        .where(eq(schema.backlinks.websiteId, websiteId));
      
      // Apply toxic filter if specified
      if (showToxic) {
        query = query.where(sql`${schema.backlinks.toxicityScore} > 50`);
      }
      
      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(schema.backlinks)
        .where(eq(schema.backlinks.websiteId, websiteId));
      
      if (showToxic) {
        countQuery.where(sql`${schema.backlinks.toxicityScore} > 50`);
      }
      
      const countResult = await countQuery.execute();
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const backlinks = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.backlinks.lastChecked))
        .execute();
      
      return res.json({
        backlinks,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting backlinks:", error);
      return res.status(500).json({ message: "Failed to fetch backlinks" });
    }
  }
  
  /**
   * Add backlink
   */
  static async addBacklink(req: Request, res: Response) {
    try {
      const backlinkData = {
        ...req.body,
        firstDiscovered: new Date(),
        lastChecked: new Date()
      };
      
      const newBacklink = await db
        .insert(schema.backlinks)
        .values(backlinkData)
        .returning()
        .execute();
      
      return res.status(201).json(newBacklink[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding backlink:", error);
      return res.status(500).json({ message: "Failed to add backlink" });
    }
  }
  
  /**
   * Update backlink status
   */
  static async updateBacklinkStatus(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    try {
      const updatedBacklink = await db
        .update(schema.backlinks)
        .set({
          status,
          lastChecked: new Date()
        })
        .where(eq(schema.backlinks.id, id))
        .returning()
        .execute();
      
      if (!updatedBacklink || updatedBacklink.length === 0) {
        return res.status(404).json({ message: "Backlink not found" });
      }
      
      return res.json(updatedBacklink[0]);
    } catch (error) {
      console.error("Error updating backlink status:", error);
      return res.status(500).json({ message: "Failed to update backlink status" });
    }
  }
}

// On-Page Optimizations API
class OnPageOptimizationAPI {
  /**
   * Get on-page optimizations
   */
  static async getOnPageOptimizations(req: Request, res: Response) {
    const websiteId = parseInt(req.params.websiteId);
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const pageUrl = req.query.pageUrl as string;
    
    try {
      let query = db
        .select()
        .from(schema.onPageOptimizations)
        .where(eq(schema.onPageOptimizations.websiteId, websiteId));
      
      // Filter by page URL if provided
      if (pageUrl) {
        query = query.where(eq(schema.onPageOptimizations.pageUrl, pageUrl));
      }
      
      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(schema.onPageOptimizations)
        .where(eq(schema.onPageOptimizations.websiteId, websiteId));
      
      if (pageUrl) {
        countQuery.where(eq(schema.onPageOptimizations.pageUrl, pageUrl));
      }
      
      const countResult = await countQuery.execute();
      const totalCount = countResult[0]?.count || 0;
      
      // Get paginated results
      const optimizations = await query
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy(desc(schema.onPageOptimizations.createdAt))
        .execute();
      
      return res.json({
        optimizations,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      });
    } catch (error) {
      console.error("Error getting on-page optimizations:", error);
      return res.status(500).json({ message: "Failed to fetch on-page optimizations" });
    }
  }
  
  /**
   * Create on-page optimization suggestion
   */
  static async createOnPageOptimization(req: Request, res: Response) {
    try {
      const optimizationData = {
        ...req.body,
        createdAt: new Date()
      };
      
      const newOptimization = await db
        .insert(schema.onPageOptimizations)
        .values(optimizationData)
        .returning()
        .execute();
      
      return res.status(201).json(newOptimization[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating on-page optimization:", error);
      return res.status(500).json({ message: "Failed to create on-page optimization" });
    }
  }
  
  /**
   * Update on-page optimization status
   */
  static async updateOnPageOptimizationStatus(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    try {
      const updatedOptimization = await db
        .update(schema.onPageOptimizations)
        .set({
          status,
          appliedAt: status === 'applied' ? new Date() : null
        })
        .where(eq(schema.onPageOptimizations.id, id))
        .returning()
        .execute();
      
      if (!updatedOptimization || updatedOptimization.length === 0) {
        return res.status(404).json({ message: "On-page optimization not found" });
      }
      
      return res.json(updatedOptimization[0]);
    } catch (error) {
      console.error("Error updating on-page optimization status:", error);
      return res.status(500).json({ message: "Failed to update on-page optimization status" });
    }
  }
}

// AI Content API (for Perplexity integration)
class AIContentAPI {
  /**
   * Generate optimized content using Perplexity API
   */
  static async generateContent(req: Request, res: Response) {
    const { content, targetKeyword, contentLength, seoOptimization, readabilityLevel } = req.body;
    
    try {
      // Check if PERPLEXITY_API_KEY is available
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(400).json({ 
          message: "Perplexity API key is not configured",
          demoMode: true,
          // Return demo data in development
          demoContent: `# Optimized Content for: ${targetKeyword}

## Introduction
This is a sample of AI-optimized content for the keyword "${targetKeyword}". In a production environment, this would be generated using the Perplexity API.

## Main Content
The content would be optimized based on your settings:
- Content Length: ${contentLength ? `Level ${contentLength}` : 'Medium'}
- SEO Optimization: ${seoOptimization ? `${seoOptimization}%` : '70%'}
- Readability Level: ${readabilityLevel ? `Level ${readabilityLevel}` : 'Intermediate'}

## Conclusion
This demonstrates how the content optimization would work. To get real AI-powered optimization, please configure the Perplexity API key.`
        });
      }
      
      // In a real implementation, this would call the Perplexity API
      // Here we're just returning a placeholder response
      
      // Store the optimization in database
      const optimizationData = {
        websiteId: 1, // Default website ID for demo
        pageUrl: "/sample-page", // Default page URL
        targetKeyword,
        originalContent: content,
        optimizedContent: "This would be the optimized content from Perplexity API",
        seoScore: 85,
        readabilityScore: 78,
        optimizationDate: new Date(),
        optimizationSettings: {
          contentLength,
          seoOptimization,
          readabilityLevel
        },
        aiGenerationPrompt: `Optimize content for keyword: ${targetKeyword}`
      };
      
      const newOptimization = await db
        .insert(schema.contentOptimizations)
        .values(optimizationData)
        .returning()
        .execute();
      
      return res.json({
        success: true,
        optimization: newOptimization[0]
      });
    } catch (error) {
      console.error("Error generating AI content:", error);
      return res.status(500).json({ message: "Failed to generate AI content" });
    }
  }
}

// Dashboard API for SEO metrics
class DashboardAPI {
  /**
   * Get SEO dashboard metrics
   */
  static async getDashboardMetrics(req: Request, res: Response) {
    try {
      // Get overall website stats
      const websiteStats = await db
        .select({
          totalWebsites: sql<number>`count(*)`,
          avgScore: sql<number>`avg(${schema.websites.seoScore})`,
        })
        .from(schema.websites)
        .execute();
      
      // Get keyword stats
      const keywordStats = await db
        .select({
          totalKeywords: sql<number>`count(*)`,
          top10Keywords: sql<number>`sum(case when ${schema.keywords.currentRanking} <= 10 then 1 else 0 end)`
        })
        .from(schema.keywords)
        .execute();
      
      // Get backlink stats
      const backlinkStats = await db
        .select({
          totalBacklinks: sql<number>`count(*)`,
          toxicBacklinks: sql<number>`sum(case when ${schema.backlinks.toxicityScore} > 50 then 1 else 0 end)`
        })
        .from(schema.backlinks)
        .execute();
      
      // Get content optimization stats
      const contentStats = await db
        .select({
          totalOptimizations: sql<number>`count(*)`,
          avgSeoScore: sql<number>`avg(${schema.contentOptimizations.seoScore})`,
          avgReadabilityScore: sql<number>`avg(${schema.contentOptimizations.readabilityScore})`
        })
        .from(schema.contentOptimizations)
        .execute();
      
      return res.json({
        websiteStats: websiteStats[0],
        keywordStats: keywordStats[0],
        backlinkStats: backlinkStats[0],
        contentStats: contentStats[0],
        // Demo metrics - in real app, this would be calculated from the database
        trendsData: {
          keywordRankings: [
            { date: '2023-01-01', value: 15 },
            { date: '2023-02-01', value: 12 },
            { date: '2023-03-01', value: 10 },
            { date: '2023-04-01', value: 8 },
            { date: '2023-05-01', value: 6 },
            { date: '2023-06-01', value: 5 }
          ],
          organicTraffic: [
            { date: '2023-01-01', value: 1200 },
            { date: '2023-02-01', value: 1500 },
            { date: '2023-03-01', value: 1800 },
            { date: '2023-04-01', value: 2200 },
            { date: '2023-05-01', value: 2800 },
            { date: '2023-06-01', value: 3200 }
          ]
        }
      });
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      return res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  }
}

// Register all SEO API routes
export function registerSEORoutes(app: Express) {
  // Website routes
  app.get("/api/websites", asyncHandler(WebsiteAPI.getWebsites));
  app.get("/api/websites/:id", asyncHandler(WebsiteAPI.getWebsiteById));
  app.post("/api/websites", asyncHandler(WebsiteAPI.createWebsite));
  app.patch("/api/websites/:id", asyncHandler(WebsiteAPI.updateWebsite));
  app.delete("/api/websites/:id", asyncHandler(WebsiteAPI.deleteWebsite));
  
  // SEO Audit routes
  app.get("/api/websites/:websiteId/audits", asyncHandler(SEOAuditAPI.getAudits));
  app.get("/api/audits/:id", asyncHandler(SEOAuditAPI.getAuditById));
  app.post("/api/audits", asyncHandler(SEOAuditAPI.createAudit));
  
  // Keyword routes
  app.get("/api/websites/:websiteId/keywords", asyncHandler(KeywordAPI.getKeywords));
  app.post("/api/keywords", asyncHandler(KeywordAPI.addKeyword));
  app.patch("/api/keywords/:id", asyncHandler(KeywordAPI.updateKeyword));
  app.delete("/api/keywords/:id", asyncHandler(KeywordAPI.deleteKeyword));
  
  // Content Optimization routes
  app.get("/api/websites/:websiteId/content-optimizations", asyncHandler(ContentOptimizationAPI.getContentOptimizations));
  app.get("/api/content-optimizations/:id", asyncHandler(ContentOptimizationAPI.getContentOptimizationById));
  app.post("/api/content-optimizations", asyncHandler(ContentOptimizationAPI.createContentOptimization));
  
  // Backlink routes
  app.get("/api/websites/:websiteId/backlinks", asyncHandler(BacklinkAPI.getBacklinks));
  app.post("/api/backlinks", asyncHandler(BacklinkAPI.addBacklink));
  app.patch("/api/backlinks/:id/status", asyncHandler(BacklinkAPI.updateBacklinkStatus));
  
  // On-page Optimization routes
  app.get("/api/websites/:websiteId/on-page-optimizations", asyncHandler(OnPageOptimizationAPI.getOnPageOptimizations));
  app.post("/api/on-page-optimizations", asyncHandler(OnPageOptimizationAPI.createOnPageOptimization));
  app.patch("/api/on-page-optimizations/:id/status", asyncHandler(OnPageOptimizationAPI.updateOnPageOptimizationStatus));
  
  // AI Content Generation routes
  app.post("/api/ai/generate-content", asyncHandler(AIContentAPI.generateContent));
  
  // Dashboard metrics
  app.get("/api/seo/dashboard", asyncHandler(DashboardAPI.getDashboardMetrics));
}