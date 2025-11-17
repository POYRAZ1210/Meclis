import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAdmin, getUserRole, supabaseAdmin } from "./services/supabase";
import { 
  insertAnnouncementSchema, 
  insertPollSchema, 
  insertBlutenPostSchema,
  createUserSchema,
} from "@shared/schema";

// Middleware to extract user ID from Supabase JWT token
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // Verify token with Supabase
  if (!supabaseAdmin) {
    return res.status(503).json({ error: "Authentication service unavailable" });
  }
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }
  
  (req as any).userId = user.id;
  next();
}

// Middleware to check admin role
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const adminCheck = await isAdmin(userId);
  
  if (!adminCheck) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Helper: Get profile ID from user ID
async function getProfileId(userId: string): Promise<string | null> {
  const { supabaseAdmin } = await import('./services/supabase');
  if (!supabaseAdmin) return null;
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  return profile?.id || null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============================================
  // ADMIN ROUTES
  // ============================================
  
  // Create announcement
  app.post('/api/admin/announcements', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validated = insertAnnouncementSchema.parse(req.body);
      const userId = (req as any).userId;
      
      // Get profile ID from user ID
      const profileId = await getProfileId(userId);
      if (!profileId) {
        return res.status(400).json({ error: "Profile not found" });
      }
      
      const announcement = await storage.createAnnouncement({
        ...validated,
        author_id: profileId,
      });
      
      res.json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update announcement
  app.patch('/api/admin/announcements/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = insertAnnouncementSchema.partial().parse(req.body);
      
      const announcement = await storage.updateAnnouncement(id, validated);
      
      res.json(announcement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete announcement
  app.delete('/api/admin/announcements/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await storage.deleteAnnouncement(id);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Create poll with options
  app.post('/api/admin/polls', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validated = insertPollSchema.parse(req.body);
      const userId = (req as any).userId;
      
      // Get profile ID from user ID
      const profileId = await getProfileId(userId);
      if (!profileId) {
        return res.status(400).json({ error: "Profile not found" });
      }
      
      const poll = await storage.createPollWithOptions({
        ...validated,
        created_by: profileId,
      });
      
      res.json(poll);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete poll
  app.delete('/api/admin/polls/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await storage.deletePoll(id);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get ALL polls with accurate vote counts (for admin panel)
  app.get('/api/admin/polls', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get all polls with options
      const { data: polls, error: pollsError } = await supabaseAdmin
        .from('polls')
        .select(`
          *,
          options:poll_options(
            id,
            poll_id,
            option_text
          )
        `)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Calculate vote counts for each option (using service_role - bypasses RLS)
      const pollsWithVotes = await Promise.all(
        polls.map(async (poll) => {
          const optionsWithVotes = await Promise.all(
            poll.options.map(async (option: any) => {
              const { count } = await supabaseAdmin
                .from('poll_votes')
                .select('*', { count: 'exact', head: true })
                .eq('option_id', option.id);

              return {
                ...option,
                vote_count: count || 0,
              };
            })
          );

          return {
            ...poll,
            options: optionsWithVotes,
          };
        })
      );

      res.json(pollsWithVotes);
    } catch (error: any) {
      console.error('Error fetching admin polls:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Toggle poll open/close
  app.patch('/api/admin/polls/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { is_open } = req.body;
      
      const poll = await storage.togglePollStatus(id, is_open);
      
      res.json(poll);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get detailed poll statistics (who voted, class breakdown)
  app.get('/api/admin/polls/:id/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get poll with options
      const { data: poll, error: pollError } = await supabaseAdmin
        .from('polls')
        .select(`
          *,
          options:poll_options(id, option_text)
        `)
        .eq('id', id)
        .single();

      if (pollError) throw pollError;

      // Get all votes with voter profile info
      const { data: votes, error: votesError } = await supabaseAdmin
        .from('poll_votes')
        .select(`
          *,
          voter:user_id (
            id,
            email
          )
        `)
        .eq('poll_id', id);

      if (votesError) throw votesError;

      // Handle empty votes case
      if (votes.length === 0) {
        return res.json({
          poll,
          total_votes: 0,
          option_stats: poll.options.map((option: any) => ({
            option_id: option.id,
            option_text: option.option_text,
            total_votes: 0,
            votes: [],
            class_breakdown: {},
          })),
          overall_class_breakdown: {},
        });
      }

      // Get profile info for each voter
      const voterIds = votes.map((v: any) => v.user_id);
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('user_id', voterIds);

      if (profilesError) throw profilesError;

      // Map profiles to votes
      const votesWithProfiles = votes.map((vote: any) => {
        const profile = profiles.find((p: any) => p.user_id === vote.user_id);
        return {
          ...vote,
          profile,
        };
      });

      // Calculate stats per option
      const optionStats = poll.options.map((option: any) => {
        const optionVotes = votesWithProfiles.filter((v: any) => v.option_id === option.id);
        
        // Group by class
        const classCounts: Record<string, number> = {};
        optionVotes.forEach((vote: any) => {
          const className = vote.profile?.class_name || 'Sınıf Yok';
          classCounts[className] = (classCounts[className] || 0) + 1;
        });

        return {
          option_id: option.id,
          option_text: option.option_text,
          total_votes: optionVotes.length,
          votes: optionVotes,
          class_breakdown: classCounts,
        };
      });

      // Overall class breakdown
      const overallClassBreakdown: Record<string, number> = {};
      votesWithProfiles.forEach((vote: any) => {
        const className = vote.profile?.class_name || 'Sınıf Yok';
        overallClassBreakdown[className] = (overallClassBreakdown[className] || 0) + 1;
      });

      res.json({
        poll,
        total_votes: votesWithProfiles.length,
        option_stats: optionStats,
        overall_class_breakdown: overallClassBreakdown,
      });
    } catch (error: any) {
      console.error('Error fetching poll stats:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Create manual blüten post
  app.post('/api/admin/bluten', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validated = insertBlutenPostSchema.parse(req.body);
      const userId = (req as any).userId;
      
      // Get profile ID from user ID
      const profileId = await getProfileId(userId);
      if (!profileId) {
        return res.status(400).json({ error: "Profile not found" });
      }
      
      const post = await storage.createManualBlutenPost({
        ...validated,
        created_by: profileId,
      });
      
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Toggle blüten visibility
  app.patch('/api/admin/bluten/:id/visibility', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { visible } = req.body;
      
      await storage.toggleBlutenVisibility(id, visible);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Create user manually
  app.post('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const validated = createUserSchema.parse(req.body);
      
      const profile = await storage.createUserWithProfile(validated);
      
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update idea status
  app.patch('/api/admin/ideas/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const reviewerId = (req as any).userId;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      await storage.updateIdeaStatus(id, status, reviewerId);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update comment status
  app.patch('/api/admin/comments/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const reviewerId = (req as any).userId;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      await storage.updateCommentStatus(id, status, reviewerId);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
