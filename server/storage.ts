import { supabaseAdmin } from './services/supabase';
import type { 
  InsertAnnouncement, 
  InsertPoll, 
  InsertBlutenPost, 
  CreateUser,
  Announcement,
  Poll,
  PollOption,
  BlutenPost,
  Profile
} from "@shared/schema";

export interface IStorage {
  // Announcements
  createAnnouncement(data: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
  
  // Polls
  createPollWithOptions(data: InsertPoll): Promise<Poll>;
  
  // Blüten
  createManualBlutenPost(data: InsertBlutenPost): Promise<BlutenPost>;
  toggleBlutenVisibility(id: string, visible: boolean): Promise<void>;
  
  // Users (Manual creation)
  createUserWithProfile(data: CreateUser): Promise<Profile>;
  
  // Moderation
  updateIdeaStatus(ideaId: string, status: 'approved' | 'rejected', reviewerId: string): Promise<void>;
  updateCommentStatus(commentId: string, status: 'approved' | 'rejected', reviewerId: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  async createAnnouncement(data: InsertAnnouncement): Promise<Announcement> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return announcement;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement>): Promise<Announcement> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async createPollWithOptions(data: InsertPoll): Promise<Poll> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        question: data.question,
        created_by: data.created_by,
        is_open: true,
      })
      .select()
      .single();
    
    if (pollError) throw pollError;
    
    // Create options
    const options = data.options.map(text => ({
      poll_id: poll.id,
      option_text: text,
      vote_count: 0,
    }));
    
    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(options);
    
    if (optionsError) throw optionsError;
    
    return poll;
  }

  async createManualBlutenPost(data: InsertBlutenPost): Promise<BlutenPost> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    const { data: post, error } = await supabaseAdmin
      .from('bluten_posts')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return post;
  }

  async toggleBlutenVisibility(id: string, visible: boolean): Promise<void> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    const { error } = await supabaseAdmin
      .from('bluten_posts')
      .update({ is_visible: visible })
      .eq('id', id);
    
    if (error) throw error;
  }

  async createUserWithProfile(data: CreateUser): Promise<Profile> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm
    });
    
    if (authError) throw authError;
    
    // Update profile (trigger auto-created it)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        class_name: data.class_name,
        student_no: data.student_no,
      })
      .eq('user_id', authUser.user.id)
      .select()
      .single();
    
    if (profileError) throw profileError;
    return profile;
  }

  async updateIdeaStatus(ideaId: string, status: 'approved' | 'rejected', reviewerUserId: string): Promise<void> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    // Get profile ID from user ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', reviewerUserId)
      .single();
    
    const { error } = await supabaseAdmin
      .from('ideas')
      .update({
        status,
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', ideaId);
    
    if (error) throw error;
  }

  async updateCommentStatus(commentId: string, status: 'approved' | 'rejected', reviewerUserId: string): Promise<void> {
    if (!supabaseAdmin) throw new Error('Supabase not configured');
    
    // Get profile ID from user ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', reviewerUserId)
      .single();
    
    const { error } = await supabaseAdmin
      .from('comments')
      .update({
        status,
        reviewed_by: profile?.id,
      })
      .eq('id', commentId);
    
    if (error) throw error;
  }
}

export const storage = new SupabaseStorage();
