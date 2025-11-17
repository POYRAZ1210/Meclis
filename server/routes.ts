import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { isAdmin, getUserRole, supabaseAdmin } from "./services/supabase";
import { 
  insertAnnouncementSchema, 
  insertPollSchema, 
  insertBlutenPostSchema,
  createUserSchema,
  insertIdeaSchema,
  insertCommentSchema,
} from "@shared/schema";

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim ve video dosyaları yüklenebilir'));
    }
  },
});

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

  // Get ALL announcements (for admin panel)
  app.get('/api/admin/announcements', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: announcements, error } = await supabaseAdmin
        .from('announcements')
        .select('*, author:profiles!announcements_author_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(announcements);
    } catch (error: any) {
      console.error('Error fetching admin announcements:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get ALL bluten posts (for admin panel)
  app.get('/api/admin/bluten', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: blutenPosts, error } = await supabaseAdmin
        .from('bluten_posts')
        .select('*')
        .order('posted_at', { ascending: false });

      if (error) throw error;

      res.json(blutenPosts);
    } catch (error: any) {
      console.error('Error fetching admin bluten:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get ALL profiles (for admin panel) with optional class filter
  app.get('/api/admin/profiles', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { className } = req.query;
      
      let query = supabaseAdmin
        .from('profiles')
        .select('*');
      
      // Apply server-side class filter if provided
      if (className && className !== 'Tümü') {
        query = query.eq('class_name', className);
      }
      
      query = query
        .order('class_name', { ascending: true })
        .order('student_no', { ascending: true });

      const { data: profiles, error } = await query;

      if (error) throw error;

      res.json(profiles);
    } catch (error: any) {
      console.error('Error fetching admin profiles:', error);
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
              const { count } = await supabaseAdmin!
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

      // Get all votes (no join - we'll fetch profiles separately)
      const { data: votes, error: votesError } = await supabaseAdmin
        .from('poll_votes')
        .select('*')
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
  
  // ============================================
  // FILE UPLOAD
  // ============================================
  
  // Upload image or video
  app.post('/api/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Dosya seçilmedi' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      const file = req.file;
      
      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `ideas/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('ideas-media')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw new Error('Dosya yüklenirken hata oluştu');
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('ideas-media')
        .getPublicUrl(filePath);

      res.json({ 
        url: publicUrl,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(400).json({ error: error.message || 'Dosya yüklenirken bir hata oluştu' });
    }
  });
  
  // ============================================
  // IDEAS ROUTES (User)
  // ============================================
  
  // Get approved ideas
  app.get('/api/ideas', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: ideas, error } = await supabaseAdmin
        .from('ideas')
        .select('*, author:profiles!ideas_author_id_fkey(first_name, last_name, class_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(ideas);
    } catch (error: any) {
      console.error('Error fetching ideas:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create new idea
  app.post('/api/ideas', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const validated = insertIdeaSchema.parse({
        ...req.body,
        author_id: userId,
      });

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Ensure profile exists (auto-create if missing)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // Auto-create profile for this user
        const { data: { user } } = await supabaseAdmin.auth.getUser(userId);
        
        await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: userId,
            email: user?.email || '',
            first_name: '',
            last_name: '',
            role: 'student',
          });
      }

      // Simple insert (no image_url/video_url for now)
      const { data: idea, error } = await supabaseAdmin
        .from('ideas')
        .insert([{
          title: validated.title,
          content: validated.content,
          author_id: userId,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw new Error('Fikir oluşturulurken bir hata oluştu');
      }

      res.json(idea);
    } catch (error: any) {
      console.error('Error creating idea:', error);
      
      // Handle Zod validation errors with user-friendly messages
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        const fieldName = firstError.path[0] === 'content' ? 'İçerik' : 
                          firstError.path[0] === 'title' ? 'Başlık' : firstError.path[0];
        res.status(400).json({ error: `${fieldName}: ${firstError.message}` });
      } else {
        res.status(400).json({ error: error.message || 'Fikir oluşturulurken bir hata oluştu' });
      }
    }
  });

  // Get single idea with comments
  app.get('/api/ideas/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get idea with author info
      const { data: idea, error: ideaError } = await supabaseAdmin
        .from('ideas')
        .select('*, author:profiles!ideas_author_id_fkey(first_name, last_name, class_name)')
        .eq('id', id)
        .single();

      if (ideaError) throw ideaError;

      // Get approved comments
      const { data: comments, error: commentsError } = await supabaseAdmin
        .from('comments')
        .select('*, author:profiles!comments_author_id_fkey(first_name, last_name, class_name)')
        .eq('idea_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Check if user liked this idea
      const { data: userLike } = await supabaseAdmin
        .from('idea_likes')
        .select('*')
        .eq('idea_id', id)
        .eq('user_id', userId)
        .single();

      res.json({
        ...idea,
        comments,
        user_has_liked: !!userLike,
      });
    } catch (error: any) {
      console.error('Error fetching idea:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Toggle like on idea
  app.post('/api/ideas/:id/like', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Check if already liked
      const { data: existingLike } = await supabaseAdmin
        .from('idea_likes')
        .select('*')
        .eq('idea_id', id)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabaseAdmin
          .from('idea_likes')
          .delete()
          .eq('idea_id', id)
          .eq('user_id', userId);

        if (error) throw error;

        res.json({ liked: false });
      } else {
        // Like
        const { error } = await supabaseAdmin
          .from('idea_likes')
          .insert({
            idea_id: id,
            user_id: userId,
          });

        if (error) throw error;

        res.json({ liked: true });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Add comment to idea
  app.post('/api/ideas/:id/comments', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const validated = insertCommentSchema.parse({
        idea_id: id,
        author_id: userId,
        content: req.body.content,
      });

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: comment, error } = await supabaseAdmin
        .from('comments')
        .insert({
          ...validated,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      res.json(comment);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // IDEAS ADMIN ROUTES
  // ============================================
  
  // Get all ideas for moderation
  app.get('/api/admin/ideas', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: ideas, error } = await supabaseAdmin
        .from('ideas')
        .select('*, author:profiles!ideas_author_id_fkey(first_name, last_name, class_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(ideas);
    } catch (error: any) {
      console.error('Error fetching admin ideas:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get pending comments for moderation
  app.get('/api/admin/comments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *, 
          author:profiles!comments_author_id_fkey(first_name, last_name, class_name),
          idea:ideas(title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(comments);
    } catch (error: any) {
      console.error('Error fetching admin comments:', error);
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

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { error } = await supabaseAdmin
        .from('ideas')
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating idea status:', error);
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

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { error } = await supabaseAdmin
        .from('comments')
        .update({
          status,
          reviewed_by: reviewerId,
        })
        .eq('id', id);

      if (error) throw error;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating comment status:', error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
