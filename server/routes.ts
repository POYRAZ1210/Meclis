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
  updateProfileSchema,
  insertIdeaSchema,
  insertCommentSchema,
  insertAnnouncementCommentSchema,
  studentRegistrationSchema,
  insertClassSchema,
  insertEventSchema,
  updateEventSchema,
  insertEventApplicationSchema,
} from "@shared/schema";

// Configure multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 25 * 1024 * 1024, // 25MB limit (increased for PDFs)
  },
  fileFilter: (_req, file, cb) => {
    // Allow images, videos, and documents (PDF, DOC, DOCX, etc.)
    const allowedMimeTypes = [
      'image/',
      'video/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];
    
    const isAllowed = allowedMimeTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim, video ve doküman dosyaları (PDF, Word, Excel, PowerPoint) yüklenebilir'));
    }
  },
});

// Configure multer for profile picture uploads - STRICT validation
const profilePictureUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
  fileFilter: (_req, file, cb) => {
    // STRICT: Only allow jpg, jpeg, png for profile pictures
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(fileExtension);
    
    if (isMimeAllowed && isExtensionAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Profil fotoğrafı için sadece JPG, JPEG ve PNG dosyaları yüklenebilir (maksimum 2MB)'));
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

  // Public announcement routes (no auth required for viewing)
  app.get('/api/announcements', async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Check if user is authenticated (optional)
      const authHeader = req.headers.authorization;
      let isAdmin = false;
      let isClassPresident = false;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        
        if (user) {
          // Get user's profile to check role and class president status
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role, is_class_president')
            .eq('user_id', user.id)
            .single();
          
          isAdmin = profile?.role === 'admin';
          isClassPresident = profile?.is_class_president || false;
        }
      }

      // Build query based on user's role and class president status
      let query = supabaseAdmin
        .from('announcements')
        .select('*, author:profiles!announcements_author_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false });

      // Filter by target audience
      if (isAdmin) {
        // Admins see ALL announcements (no filter)
        // No additional filtering needed
      } else if (isClassPresident) {
        // Class presidents see both 'all' and 'class_presidents' announcements
        query = query.in('target_audience', ['all', 'class_presidents']);
      } else {
        // Regular users only see 'all' announcements
        query = query.eq('target_audience', 'all');
      }

      const { data: announcements, error } = await query;

      if (error) throw error;

      res.json(announcements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/announcements/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: announcement, error } = await supabaseAdmin
        .from('announcements')
        .select('*, author:profiles!announcements_author_id_fkey(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.json(announcement);
    } catch (error: any) {
      console.error('Error fetching announcement:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // ANNOUNCEMENT COMMENTS
  // ============================================

  // Create announcement comment (with optional reply)
  app.post('/api/announcements/:id/comments', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content, parent_id, is_anonymous } = req.body;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID and name from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Profil bulunamadı');
      }

      const validated = insertAnnouncementCommentSchema.parse({
        announcement_id: id,
        author_id: profile.id,
        content: content,
        is_anonymous: is_anonymous || false,
      });

      const { data: comment, error } = await supabaseAdmin
        .from('announcement_comments')
        .insert({
          ...validated,
          parent_id: parent_id || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // If this is a reply, create notification for the parent comment author
      if (parent_id) {
        const { data: parentComment } = await supabaseAdmin
          .from('announcement_comments')
          .select('author_id')
          .eq('id', parent_id)
          .single();

        if (parentComment && parentComment.author_id !== profile.id) {
          const replierName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Birisi';
          const shortContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
          console.log('Creating reply notification for user:', parentComment.author_id);
          const { error: notifError } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: parentComment.author_id,
              type: 'reply_received',
              title: 'Yorumunuza Yanıt Geldi!',
              message: `${replierName} yorumunuza yanıt verdi: "${shortContent}"`,
              link: '/duyurular',
            });
          if (notifError) {
            console.error('Error creating reply notification:', notifError);
          } else {
            console.log('Reply notification created successfully');
          }
        }
      }

      res.json(comment);
    } catch (error: any) {
      console.error('Error adding announcement comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get approved announcement comments (public - no auth required)
  app.get('/api/announcements/:id/comments', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if user is admin
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ') && supabaseAdmin) {
        const token = authHeader.substring(7);
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          if (!error && user) {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('role')
              .eq('user_id', user.id)
              .single();
            isAdmin = profile?.role === 'admin';
          }
        } catch (e) {
          // Continue without admin status
        }
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: comments, error } = await supabaseAdmin
        .from('announcement_comments')
        .select(`
          *,
          author:profiles!announcement_comments_author_id_fkey(first_name, last_name, class_name, student_no)
        `)
        .eq('announcement_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mask anonymous authors for non-admins, but keep is_anonymous flag
      const processedComments = (comments || []).map((comment: any) => {
        if (comment.is_anonymous && !isAdmin) {
          return { 
            ...comment, 
            author: null,
            is_anonymous: true 
          };
        }
        return {
          ...comment,
          is_anonymous: comment.is_anonymous || false
        };
      });

      res.json(processedComments);
    } catch (error: any) {
      console.error('Error fetching announcement comments:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get pending announcement comments (for admin moderation)
  app.get('/api/admin/announcement-comments', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: comments, error } = await supabaseAdmin
        .from('announcement_comments')
        .select(`
          *,
          author:profiles!announcement_comments_author_id_fkey(first_name, last_name, class_name),
          announcement:announcements(title)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(comments);
    } catch (error: any) {
      console.error('Error fetching admin announcement comments:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update announcement comment status
  app.patch('/api/admin/announcement-comments/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).userId;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get reviewer's profile ID
      const reviewerProfileId = await getProfileId(userId);
      if (!reviewerProfileId) {
        return res.status(400).json({ error: "Reviewer profile not found" });
      }

      // Get comment info for notification
      const { data: comment } = await supabaseAdmin
        .from('announcement_comments')
        .select('author_id, announcement_id, content')
        .eq('id', id)
        .single();

      const { error } = await supabaseAdmin
        .from('announcement_comments')
        .update({
          status,
          reviewed_by: reviewerProfileId,
        })
        .eq('id', id);

      if (error) throw error;

      // Create notification for the comment author
      if (comment?.author_id) {
        const shortContent = comment.content.length > 50 
          ? comment.content.substring(0, 50) + '...' 
          : comment.content;
        console.log('Creating notification for user:', comment.author_id);
        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: comment.author_id,
            type: status === 'approved' ? 'announcement_comment_approved' : 'announcement_comment_rejected',
            title: status === 'approved' ? 'Yorumunuz Onaylandı!' : 'Yorumunuz Reddedildi',
            message: status === 'approved' 
              ? `"${shortContent}" yorumunuz onaylandı ve yayınlandı.`
              : `"${shortContent}" yorumunuz reddedildi.`,
            link: status === 'approved' ? '/duyurular' : undefined,
          });
        if (notifError) {
          console.error('Error creating notification:', notifError);
        } else {
          console.log('Notification created successfully');
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating announcement comment status:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Edit own announcement comment (sets status back to pending for re-approval)
  app.patch('/api/announcement-comments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Yorum içeriği boş olamaz' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      // Check if user owns this comment
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('announcement_comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (commentError || !comment) {
        return res.status(404).json({ error: 'Yorum bulunamadı' });
      }

      if (comment.author_id !== profile.id) {
        return res.status(403).json({ error: 'Bu yorumu düzenleme yetkiniz yok' });
      }

      // Update comment and set status back to pending
      const { data: updatedComment, error } = await supabaseAdmin
        .from('announcement_comments')
        .update({
          content: content.trim(),
          status: 'pending',
          reviewed_by: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(updatedComment);
    } catch (error: any) {
      console.error('Error editing announcement comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete own announcement comment
  app.delete('/api/announcement-comments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID and role from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      // Check if user owns this comment or is admin
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('announcement_comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (commentError || !comment) {
        return res.status(404).json({ error: 'Yorum bulunamadı' });
      }

      const isOwner = comment.author_id === profile.id;
      const isAdmin = profile.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok' });
      }

      // Delete the comment
      const { error } = await supabaseAdmin
        .from('announcement_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting announcement comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // BLÜTEN
  // ============================================

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

  // Publish poll results (closes voting and shows results)
  app.patch('/api/admin/polls/:id/publish-results', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Close the poll and publish results
      const { data: poll, error } = await supabaseAdmin
        .from('polls')
        .update({ 
          is_open: false,
          results_published: true
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(poll);
    } catch (error: any) {
      console.error('Error publishing poll results:', error);
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
  
  // Get all users (admin only)
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(profiles);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // CLASSES MANAGEMENT
  // ============================================
  
  // Get all classes (public - for registration form)
  app.get('/api/classes', async (_req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data, error } = await supabaseAdmin
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new class (admin only)
  app.post('/api/classes', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const validated = insertClassSchema.parse(req.body);

      // Check if class already exists
      const { data: existing } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('name', validated.name)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'Bu sınıf zaten mevcut' });
      }

      const { data, error } = await supabaseAdmin
        .from('classes')
        .insert({ name: validated.name })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating class:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Geçersiz sınıf adı' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete a class (admin only)
  app.delete('/api/classes/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting class:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // LOGIN WITH NAME (instead of email)
  // ============================================
  app.post('/api/auth/login-with-name', async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
      }

      const { firstName, lastName, password } = req.body;

      if (!firstName || !lastName || !password) {
        return res.status(400).json({ error: 'Ad, soyad ve şifre gereklidir' });
      }

      // Find user by first name and last name (case-insensitive)
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .ilike('first_name', firstName.trim())
        .ilike('last_name', lastName.trim());

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        return res.status(500).json({ error: 'Kullanıcı aranırken hata oluştu' });
      }

      if (!profiles || profiles.length === 0) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
      }

      // If multiple profiles with same name exist, try each one
      let authenticatedUser = null;
      let matchedProfile = null;

      for (const profile of profiles) {
        // Get user's email from auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
        
        if (authError || !authUser?.user?.email) {
          continue;
        }

        // Try to sign in with this email
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
          email: authUser.user.email,
          password: password,
        });

        if (!signInError && signInData.session) {
          authenticatedUser = signInData;
          matchedProfile = profile;
          break;
        }
      }

      if (!authenticatedUser || !authenticatedUser.session) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı veya şifre hatalı' });
      }

      // For now, don't require email - can be enabled later with email_added column
      // const requiresEmail = !matchedProfile?.email_added;

      res.json({
        accessToken: authenticatedUser.session.access_token,
        refreshToken: authenticatedUser.session.refresh_token,
        requiresEmail: false,
      });
    } catch (error: any) {
      console.error('Login with name error:', error);
      res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
    }
  });

  // ============================================
  // ADD EMAIL TO PROFILE (first login requirement)
  // ============================================
  app.post('/api/auth/add-email', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
      }

      const userId = (req as any).userId;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'E-posta adresi gereklidir' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
      }

      // Update auth user email
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: email.toLowerCase().trim(),
      });

      if (updateAuthError) {
        console.error('Update auth email error:', updateAuthError);
        if (updateAuthError.message?.includes('already registered')) {
          return res.status(400).json({ error: 'Bu e-posta adresi başka bir hesapta kullanılıyor' });
        }
        return res.status(400).json({ error: 'E-posta güncellenemedi' });
      }

      // Mark email as added in profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ email_added: true })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Update profile email_added error:', profileError);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Add email error:', error);
      res.status(500).json({ error: 'E-posta eklenirken bir hata oluştu' });
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

  // Update user profile
  app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validated = updateProfileSchema.parse(req.body);
      
      const profile = await storage.updateProfile(id, validated);
      
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete user
  app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // First get profile to find user_id
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (profileError || !profile) {
        throw new Error('Kullanıcı bulunamadı');
      }

      await storage.deleteUser(profile.user_id);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // ============================================
  // FILE UPLOAD
  // ============================================
  
  // Upload profile picture - STRICT validation (2MB, only JPG/PNG)
  app.post('/api/upload/profile-picture', requireAuth, profilePictureUpload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Dosya seçilmedi' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      const file = req.file;
      
      // STRICT server-side validation for security (double-check multer filter)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      
      // Validate MIME type
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Sadece JPG, JPEG ve PNG dosyaları yüklenebilir' });
      }
      
      // Validate file extension
      const fileExt = file.originalname.split('.').pop()?.toLowerCase();
      if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
        return res.status(400).json({ error: 'Geçersiz dosya uzantısı. Sadece .jpg, .jpeg, .png dosyaları kabul edilir' });
      }
      
      // Double-check file size (multer should catch this, but verify)
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'Dosya boyutu 2MB\'dan küçük olmalıdır' });
      }
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

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

      // Update profile with new picture URL and set status to pending
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error('Profil bulunamadı');
      }

      // Update profile picture with pending status
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          profile_picture_url: publicUrl,
          profile_picture_status: 'pending',
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Log profile photo upload
      await supabaseAdmin.from('profile_photo_logs').insert({
        user_id: userId,
        image_url: publicUrl,
        action: 'upload',
      });

      res.json({ 
        url: publicUrl,
        status: 'pending',
      });
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      res.status(400).json({ error: error.message || 'Profil fotoğrafı yüklenirken bir hata oluştu' });
    }
  });

  // Upload image, video, or document (PDF, Word, etc.)
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

      // Determine file type for response
      let fileType: 'image' | 'video' | 'pdf' | 'document' = 'document';
      if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        fileType = 'video';
      } else if (file.mimetype === 'application/pdf') {
        fileType = 'pdf';
      }

      res.json({ 
        url: publicUrl,
        type: fileType,
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      res.status(400).json({ error: error.message || 'Dosya yüklenirken bir hata oluştu' });
    }
  });
  
  // ============================================
  // IDEAS ROUTES (User)
  // ============================================
  
  // Get approved ideas (public - no auth required)
  app.get('/api/ideas', async (req: Request, res: Response) => {
    try {
      // Extract userId from Authorization header
      let userId: string | null = null;
      let userRole: string = 'student';
      const authHeader = req.headers.authorization;
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          if (supabaseAdmin) {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && user) {
              userId = user.id;
              // Get user role
              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('user_id', user.id)
                .single();
              if (profile) {
                userRole = profile.role;
              }
            }
          }
        } catch (e) {
          // Token validation failed, continue without user
        }
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const supabase = supabaseAdmin; // Store for closure
      const isAdmin = userRole === 'admin';

      const { data: ideas, error } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(first_name, last_name, class_name, profile_picture_url, profile_picture_status),
          comments:comments!comments_idea_id_fkey(id, content, created_at, status, is_anonymous, author_id, parent_id, author:profiles!comments_author_id_fkey(first_name, last_name, profile_picture_url, profile_picture_status))
        `)
        .eq('status', 'approved')
        .eq('comments.status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ideas user has liked and mask anonymous authors for non-admins
      const ideasWithLikes = await Promise.all(
        (ideas || []).map(async (idea: any) => {
          // Mask author if anonymous and user is not admin
          let processedIdea = { ...idea };
          if (idea.is_anonymous && !isAdmin) {
            processedIdea.author = null;
          }
          
          // Mask comment authors if anonymous and user is not admin
          if (processedIdea.comments) {
            processedIdea.comments = processedIdea.comments.map((comment: any) => {
              if (comment.is_anonymous && !isAdmin) {
                return { ...comment, author: null };
              }
              return comment;
            });
          }

          if (!userId) {
            return {
              ...processedIdea,
              user_has_liked: false,
            };
          }

          const { data: userLike } = await supabase
            .from('idea_likes')
            .select('*')
            .eq('idea_id', idea.id)
            .eq('user_id', userId)
            .maybeSingle();

          return {
            ...processedIdea,
            user_has_liked: !!userLike,
          };
        })
      );

      res.json(ideasWithLikes);
    } catch (error: any) {
      console.error('Error fetching ideas:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Create new idea
  app.post('/api/ideas', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId; // This is the auth user ID
      
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get or create profile and get the profile ID
      let profileId: string | null = null;
      
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
      } else if (!profileCheckError) {
        // Auto-create profile for this user
        console.log('Creating profile for user:', userId);
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(userId);
        
        if (userError) {
          console.error('Error fetching user:', userError);
          throw new Error('Kullanıcı bilgisi alınamadı');
        }
        
        const { data: newProfile, error: insertProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: userId,
            email: user?.email || '',
            first_name: '',
            last_name: '',
            role: 'student',
          })
          .select('id')
          .single();

        if (insertProfileError || !newProfile) {
          console.error('Error creating profile:', insertProfileError);
          throw new Error('Profil oluşturulamadı. Lütfen yönetici ile iletişime geçin.');
        }
        
        profileId = newProfile.id;
        console.log('Profile created successfully with ID:', profileId);
      } else {
        throw new Error('Profil bilgisi alınamadı');
      }

      if (!profileId) {
        throw new Error('Profil ID bulunamadı');
      }

      // Validate with the correct author_id (profile ID, not user ID)
      const validated = insertIdeaSchema.parse({
        ...req.body,
        author_id: profileId, // Use profile ID, not user ID!
      });

      // Insert idea with image_url and video_url support
      const insertData: any = {
        title: validated.title,
        content: validated.content,
        author_id: profileId, // Use profile ID!
        status: 'pending',
        is_anonymous: validated.is_anonymous || false,
      };

      // Add optional media URLs if provided
      if (validated.image_url) {
        insertData.image_url = validated.image_url;
      }
      if (validated.video_url) {
        insertData.video_url = validated.video_url;
      }
      if (validated.attachment_url) {
        insertData.attachment_url = validated.attachment_url;
      }
      if (validated.attachment_type) {
        insertData.attachment_type = validated.attachment_type;
      }

      const { data: idea, error } = await supabaseAdmin
        .from('ideas')
        .insert([insertData])
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

  // Get single idea with comments (public - no auth required)
  app.get('/api/ideas/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId; // Optional - only set if authenticated

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

      // Check if user liked this idea (only if authenticated)
      let userHasLiked = false;
      if (userId) {
        const { data: userLike } = await supabaseAdmin
          .from('idea_likes')
          .select('*')
          .eq('idea_id', id)
          .eq('user_id', userId)
          .maybeSingle();
        
        userHasLiked = !!userLike;
      }

      res.json({
        ...idea,
        comments,
        user_has_liked: userHasLiked,
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
        .maybeSingle();

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
        // Like - use upsert to handle race conditions
        const { error } = await supabaseAdmin
          .from('idea_likes')
          .upsert({
            idea_id: id,
            user_id: userId,
          }, {
            onConflict: 'idea_id,user_id'
          });

        if (error) throw error;

        res.json({ liked: true });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Ignore duplicate key errors - just return success
      if (error.code === '23505') {
        return res.json({ liked: true });
      }
      res.status(400).json({ error: error.message });
    }
  });

  // Add comment to idea (with optional reply)
  app.post('/api/ideas/:id/comments', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content, parent_id, is_anonymous } = req.body;
      const userId = (req as any).userId; // This is the auth user ID

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID and name from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Profil bulunamadı');
      }

      const validated = insertCommentSchema.parse({
        idea_id: id,
        author_id: profile.id, // Use profile ID instead of auth user ID
        content: content,
        is_anonymous: is_anonymous || false,
      });

      const { data: comment, error } = await supabaseAdmin
        .from('comments')
        .insert({
          ...validated,
          parent_id: parent_id || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // If this is a reply, create notification for the parent comment author
      if (parent_id) {
        const { data: parentComment } = await supabaseAdmin
          .from('comments')
          .select('author_id')
          .eq('id', parent_id)
          .single();

        if (parentComment && parentComment.author_id !== profile.id) {
          const replierName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Birisi';
          const shortContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: parentComment.author_id,
              type: 'reply_received',
              title: 'Yorumunuza Yanıt Geldi!',
              message: `${replierName} yorumunuza yanıt verdi: "${shortContent}"`,
              link: '/fikirler',
            });
        }
      }

      res.json(comment);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Edit own comment (sets status back to pending for re-approval)
  app.patch('/api/comments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Yorum içeriği boş olamaz' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      // Check if user owns this comment
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (commentError || !comment) {
        return res.status(404).json({ error: 'Yorum bulunamadı' });
      }

      if (comment.author_id !== profile.id) {
        return res.status(403).json({ error: 'Bu yorumu düzenleme yetkiniz yok' });
      }

      // Update comment and set status back to pending
      const { data: updatedComment, error } = await supabaseAdmin
        .from('comments')
        .update({
          content: content.trim(),
          status: 'pending',
          reviewed_by: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(updatedComment);
    } catch (error: any) {
      console.error('Error editing comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete comment (own or admin)
  app.delete('/api/comments/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID and role from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      // Check if user owns this comment or is admin
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('comments')
        .select('author_id')
        .eq('id', id)
        .single();

      if (commentError || !comment) {
        return res.status(404).json({ error: 'Yorum bulunamadı' });
      }

      const isOwner = comment.author_id === profile.id;
      const isAdmin = profile.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok' });
      }

      // Delete the comment
      const { error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================

  // Get user's notifications
  app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      const { data: notifications, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json(notifications || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/unread-count', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      res.json({ count: count || 0 });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', profile.id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark all notifications as read
  app.patch('/api/notifications/read-all', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get profile ID from auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
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
      const userId = (req as any).userId;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get reviewer's profile ID (not user ID!)
      const reviewerProfileId = await getProfileId(userId);
      if (!reviewerProfileId) {
        return res.status(400).json({ error: "Reviewer profile not found" });
      }

      // Get idea info for notification
      const { data: idea } = await supabaseAdmin
        .from('ideas')
        .select('author_id, title')
        .eq('id', id)
        .single();

      const { error } = await supabaseAdmin
        .from('ideas')
        .update({
          status,
          reviewed_by: reviewerProfileId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Create notification for the idea author
      if (idea?.author_id) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: idea.author_id,
            type: status === 'approved' ? 'idea_approved' : 'idea_rejected',
            title: status === 'approved' ? 'Fikriniz Onaylandı!' : 'Fikriniz Reddedildi',
            message: status === 'approved' 
              ? `"${idea.title}" başlıklı fikriniz onaylandı ve yayınlandı.`
              : `"${idea.title}" başlıklı fikriniz reddedildi.`,
            link: status === 'approved' ? '/fikirler' : undefined,
          });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating idea status:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete idea
  app.delete('/api/admin/ideas/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Delete associated comments first (cascade)
      await supabaseAdmin
        .from('comments')
        .delete()
        .eq('idea_id', id);

      // Delete idea
      const { error } = await supabaseAdmin
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting idea:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update comment status
  app.patch('/api/admin/comments/:id/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).userId;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get reviewer's profile ID (not user ID!)
      const reviewerProfileId = await getProfileId(userId);
      if (!reviewerProfileId) {
        return res.status(400).json({ error: "Reviewer profile not found" });
      }

      // Get comment info for notification
      const { data: comment } = await supabaseAdmin
        .from('comments')
        .select('author_id, idea_id, content')
        .eq('id', id)
        .single();

      const { error } = await supabaseAdmin
        .from('comments')
        .update({
          status,
          reviewed_by: reviewerProfileId,
        })
        .eq('id', id);

      if (error) throw error;

      // Create notification for the comment author
      if (comment?.author_id) {
        const shortContent = comment.content.length > 50 
          ? comment.content.substring(0, 50) + '...' 
          : comment.content;
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: comment.author_id,
            type: status === 'approved' ? 'comment_approved' : 'comment_rejected',
            title: status === 'approved' ? 'Yorumunuz Onaylandı!' : 'Yorumunuz Reddedildi',
            message: status === 'approved' 
              ? `"${shortContent}" yorumunuz onaylandı ve yayınlandı.`
              : `"${shortContent}" yorumunuz reddedildi.`,
            link: status === 'approved' ? '/fikirler' : undefined,
          });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating comment status:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // PROFILE PICTURE ROUTES (Admin)
  // ============================================

  // Upload/update profile picture (user)
  app.post('/api/profile/picture', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { profile_picture_url } = req.body;

      if (!profile_picture_url) {
        return res.status(400).json({ error: 'Profil fotoğrafı URL gerekli' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get user's profile ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error('Profil bulunamadı');
      }

      // Update profile picture with pending status
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          profile_picture_url,
          profile_picture_status: 'pending',
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Log profile photo upload
      await supabaseAdmin.from('profile_photo_logs').insert({
        user_id: userId,
        image_url: profile_picture_url,
        action: 'upload',
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get pending profile pictures (admin only)
  app.get('/api/admin/profile-pictures', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('profile_picture_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(profiles || []);
    } catch (error: any) {
      console.error('Error fetching pending profile pictures:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Approve profile picture (admin only)
  app.post('/api/admin/profile-pictures/:id/approve', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ profile_picture_status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error approving profile picture:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Reject profile picture (admin only)
  app.post('/api/admin/profile-pictures/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get the profile before update to log the old picture URL
      const { data: oldProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id, profile_picture_url')
        .eq('id', id)
        .single();

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          profile_picture_status: 'rejected',
          profile_picture_url: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the profile photo rejection
      if (oldProfile?.profile_picture_url) {
        await supabaseAdmin.from('profile_photo_logs').insert({
          user_id: oldProfile.user_id,
          image_url: oldProfile.profile_picture_url,
          action: 'delete',
        });

        await supabaseAdmin.from('action_logs').insert({
          user_id: adminUserId,
          action_type: 'PROFILE_PHOTO_RESET',
          target_id: id,
          target_type: 'profile',
          details: `Admin rejected profile picture`,
        });
      }

      res.json(data);
    } catch (error: any) {
      console.error('Error rejecting profile picture:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Reset profile picture (admin only) - force remove any user's profile picture
  app.post('/api/admin/users/:id/reset-picture', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get the profile before update
      const { data: oldProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id, profile_picture_url')
        .eq('id', id)
        .single();

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          profile_picture_url: null,
          profile_picture_status: 'approved',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      if (oldProfile?.profile_picture_url) {
        await supabaseAdmin.from('profile_photo_logs').insert({
          user_id: oldProfile.user_id,
          image_url: oldProfile.profile_picture_url,
          action: 'reset',
        });
      }

      await supabaseAdmin.from('action_logs').insert({
        user_id: adminUserId,
        action_type: 'PROFILE_PHOTO_RESET',
        target_id: id,
        target_type: 'profile',
        details: `Admin reset profile picture`,
      });

      res.json(data);
    } catch (error: any) {
      console.error('Error resetting profile picture:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Suspend user (admin only)
  app.post('/api/admin/users/:id/suspend', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get user_id from profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Ban user in Supabase Auth
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.user_id,
        { ban_duration: '876000h' } // ~100 years
      );

      if (banError) throw banError;

      // Log the action
      await supabaseAdmin.from('action_logs').insert({
        user_id: adminUserId,
        action_type: 'USER_SUSPENDED',
        target_id: id,
        target_type: 'user',
        details: `Admin suspended user`,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error suspending user:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Activate user (admin only) - remove suspension
  app.post('/api/admin/users/:id/activate', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get user_id from profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      // Unban user in Supabase Auth
      const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.user_id,
        { ban_duration: 'none' }
      );

      if (unbanError) throw unbanError;

      // Log the action
      await supabaseAdmin.from('action_logs').insert({
        user_id: adminUserId,
        action_type: 'USER_ACTIVATED',
        target_id: id,
        target_type: 'user',
        details: `Admin activated user`,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error activating user:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete comment (admin only)
  app.delete('/api/admin/comments/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get comment info before deletion
      const { data: comment } = await supabaseAdmin
        .from('comments')
        .select('author_id, idea_id, content')
        .eq('id', id)
        .single();

      // Delete the comment
      const { error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the action
      await supabaseAdmin.from('action_logs').insert({
        user_id: adminUserId,
        action_type: 'COMMENT_DELETED',
        target_id: id,
        target_type: 'comment',
        details: comment ? `Deleted comment on idea ${comment.idea_id}: "${comment.content?.substring(0, 100)}..."` : 'Deleted comment',
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Clear likes for an idea (admin only)
  app.delete('/api/admin/ideas/:id/likes', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).userId;

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      // Get count before deletion
      const { count } = await supabaseAdmin
        .from('idea_likes')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', id);

      // Delete all likes
      const { error } = await supabaseAdmin
        .from('idea_likes')
        .delete()
        .eq('idea_id', id);

      if (error) throw error;

      // Update the likes count on idea
      await supabaseAdmin
        .from('ideas')
        .update({ likes_count: 0 })
        .eq('id', id);

      // Log the action
      await supabaseAdmin.from('action_logs').insert({
        user_id: adminUserId,
        action_type: 'LIKE_REMOVED',
        target_id: id,
        target_type: 'idea',
        details: `Admin cleared ${count || 0} likes from idea`,
      });

      res.json({ success: true, cleared: count || 0 });
    } catch (error: any) {
      console.error('Error clearing likes:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // EVENTS (Etkinlikler) MANAGEMENT
  // ============================================

  // Get all events (admin only)
  app.get('/api/admin/events', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { data, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create event (admin only)
  app.post('/api/admin/events', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      const profileId = await getProfileId(userId);
      
      const validated = insertEventSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from('events')
        .insert({
          name: validated.name,
          description: validated.description || null,
          is_active: validated.is_active,
          form_fields: validated.form_fields,
          created_by: profileId,
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error creating event:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update event (admin only)
  app.patch('/api/admin/events/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;
      const validated = updateEventSchema.parse(req.body);

      const updateData: any = {};
      if (validated.name !== undefined) updateData.name = validated.name;
      if (validated.description !== undefined) updateData.description = validated.description;
      if (validated.is_active !== undefined) updateData.is_active = validated.is_active;
      if (validated.form_fields !== undefined) updateData.form_fields = validated.form_fields;

      const { data, error } = await supabaseAdmin
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error updating event:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Delete event (admin only)
  app.delete('/api/admin/events/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;

      // First delete all applications for this event
      await supabaseAdmin
        .from('event_applications')
        .delete()
        .eq('event_id', id);

      // Then delete the event
      const { error } = await supabaseAdmin
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get applications for an event (admin only)
  app.get('/api/admin/events/:id/applications', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('event_applications')
        .select(`
          *,
          profile:profiles!event_applications_profile_id_fkey(first_name, last_name, class_name, student_no, user_id)
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get email addresses from auth.users
      const applicationsWithEmail = await Promise.all(
        (data || []).map(async (app: any) => {
          let email = '';
          if (app.profile?.user_id) {
            const { data: userData } = await supabaseAdmin!.auth.admin.getUserById(app.profile.user_id);
            email = userData?.user?.email || '';
          }
          return {
            ...app,
            profile: {
              ...app.profile,
              email,
            },
          };
        })
      );

      res.json(applicationsWithEmail);
    } catch (error: any) {
      console.error('Error fetching event applications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // EVENTS - PUBLIC (Öğrenci tarafı)
  // ============================================

  // Get active events (authenticated users)
  app.get('/api/events', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      const profileId = await getProfileId(userId);

      // Get active events
      const { data: events, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which events the user has already applied to
      if (profileId && events && events.length > 0) {
        const { data: applications } = await supabaseAdmin
          .from('event_applications')
          .select('event_id')
          .eq('profile_id', profileId);

        const appliedEventIds = new Set((applications || []).map((a: any) => a.event_id));
        
        const eventsWithStatus = events.map((event: any) => ({
          ...event,
          has_applied: appliedEventIds.has(event.id),
        }));

        return res.json(eventsWithStatus);
      }

      res.json(events || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single event details
  app.get('/api/events/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;
      const userId = (req as any).userId;
      const profileId = await getProfileId(userId);

      const { data: event, error } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user has already applied
      let has_applied = false;
      if (profileId) {
        const { data: application } = await supabaseAdmin
          .from('event_applications')
          .select('id')
          .eq('event_id', id)
          .eq('profile_id', profileId)
          .maybeSingle();
        
        has_applied = !!application;
      }

      res.json({ ...event, has_applied });
    } catch (error: any) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit application to an event
  app.post('/api/events/:id/apply', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;
      const userId = (req as any).userId;
      const profileId = await getProfileId(userId);

      if (!profileId) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      // Check if event exists and is active
      const { data: event, error: eventError } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError || !event) {
        return res.status(404).json({ error: 'Etkinlik bulunamadı' });
      }

      if (!event.is_active) {
        return res.status(400).json({ error: 'Bu etkinlik artık başvuruya kapalı' });
      }

      // Check if user has already applied
      const { data: existingApp } = await supabaseAdmin
        .from('event_applications')
        .select('id')
        .eq('event_id', id)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existingApp) {
        return res.status(409).json({ error: 'Bu etkinliğe zaten başvurdunuz' });
      }

      // Validate responses against form fields
      const { responses } = req.body;
      const formFields = event.form_fields as any[];
      
      for (const field of formFields) {
        if (field.required && (!responses || !responses[field.id] || responses[field.id].trim() === '')) {
          return res.status(400).json({ error: `${field.label} alanı zorunludur` });
        }
      }

      // Create application
      const { data, error } = await supabaseAdmin
        .from('event_applications')
        .insert({
          event_id: id,
          profile_id: profileId,
          responses: responses || {},
        })
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // SECURE PUBLIC API ENDPOINTS (Authenticated Users)
  // These replace direct Supabase access from frontend
  // ============================================

  // GET /api/polls - Get all polls (authenticated users only)
  app.get('/api/polls', requireAuth, async (req: Request, res: Response) => {
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

      // Calculate vote counts for each option
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
      console.error('Error fetching polls:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/polls/:id - Get single poll (authenticated users only)
  app.get('/api/polls/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;

      const { data: poll, error } = await supabaseAdmin
        .from('polls')
        .select(`
          *,
          options:poll_options(
            id,
            poll_id,
            option_text
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Calculate vote counts for each option
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

      res.json({
        ...poll,
        options: optionsWithVotes,
      });
    } catch (error: any) {
      console.error('Error fetching poll:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/polls/:id/my-vote - Get user's vote for a poll
  app.get('/api/polls/:id/my-vote', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;
      const userId = (req as any).userId;

      const { data, error } = await supabaseAdmin
        .from('poll_votes')
        .select('*')
        .eq('poll_id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error fetching user vote:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // POST /api/polls/:id/vote - Vote on a poll (authenticated users only)
  app.post('/api/polls/:id/vote', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id: pollId } = req.params;
      const { option_id: optionId } = req.body;
      const userId = (req as any).userId;

      if (!optionId) {
        return res.status(400).json({ error: 'option_id gerekli' });
      }

      // Check if poll exists and is open
      const { data: poll, error: pollError } = await supabaseAdmin
        .from('polls')
        .select('is_open, results_published')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      if (!poll.is_open) {
        return res.status(400).json({ error: 'Bu oylama kapatılmıştır' });
      }

      if (poll.results_published) {
        return res.status(400).json({ error: 'Sonuçlar yayınlandı, artık oy veremezsiniz' });
      }

      // Verify option belongs to this poll
      const { data: option, error: optionError } = await supabaseAdmin
        .from('poll_options')
        .select('id')
        .eq('id', optionId)
        .eq('poll_id', pollId)
        .single();

      if (optionError || !option) {
        return res.status(400).json({ error: 'Geçersiz seçenek' });
      }

      // Upsert vote (allows changing vote)
      const { data, error } = await supabaseAdmin
        .from('poll_votes')
        .upsert(
          { poll_id: pollId, option_id: optionId, user_id: userId },
          { onConflict: 'poll_id,user_id' }
        )
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error voting on poll:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/profiles - Get profiles (authenticated, role-based filtering)
  app.get('/api/profiles', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      const { className } = req.query;

      // Get user's role
      const role = await getUserRole(userId);

      let query = supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, class_name, student_no, role, gender, profile_picture_url');

      // Role-based filtering: students can only see limited info
      // Teachers and admins can see all profiles
      if (role === 'student') {
        // Students can only see their own class
        const profileId = await getProfileId(userId);
        if (profileId) {
          const { data: ownProfile } = await supabaseAdmin
            .from('profiles')
            .select('class_name')
            .eq('id', profileId)
            .single();
          
          if (ownProfile?.class_name) {
            query = query.eq('class_name', ownProfile.class_name);
          }
        }
      } else if (className && className !== 'Tümü') {
        // Admins/teachers can filter by class
        query = query.eq('class_name', className);
      }

      query = query
        .order('class_name', { ascending: true })
        .order('student_no', { ascending: true });

      const { data: profiles, error } = await query;

      if (error) throw error;

      res.json(profiles);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/profiles/me - Get current user's profile
  app.get('/api/profiles/me', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error fetching own profile:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // PATCH /api/profiles/me - Update current user's profile (only own profile)
  app.patch('/api/profiles/me', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const userId = (req as any).userId;
      
      // Validate input - only allow certain fields to be updated
      const allowedFields = ['first_name', 'last_name', 'gender'];
      const updates: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Güncellenecek alan bulunamadı' });
      }

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's own application for an event
  app.get('/api/events/:id/my-application', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Supabase not configured' });
      }

      const { id } = req.params;
      const userId = (req as any).userId;
      const profileId = await getProfileId(userId);

      if (!profileId) {
        return res.status(400).json({ error: 'Profil bulunamadı' });
      }

      const { data, error } = await supabaseAdmin
        .from('event_applications')
        .select('*')
        .eq('event_id', id)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;

      res.json(data);
    } catch (error: any) {
      console.error('Error fetching application:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
