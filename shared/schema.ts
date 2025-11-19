import { z } from "zod";

// ============================================
// PROFILES
// ============================================
export const insertProfileSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().min(1, "Ad gerekli").optional(),
  last_name: z.string().min(1, "Soyad gerekli").optional(),
  role: z.enum(['admin', 'teacher', 'student']).default('student'),
  class_name: z.string().optional(),
  student_no: z.string().optional(),
  gender: z.string().optional(),
  is_class_president: z.boolean().default(false),
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'teacher' | 'student';
  class_name?: string;
  student_no?: string;
  gender?: string;
  is_class_president: boolean;
  created_at: string;
}

// ============================================
// ANNOUNCEMENTS
// ============================================
export const insertAnnouncementSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  author_id: z.string().uuid().optional(),
  target_audience: z.enum(['all', 'class_presidents']).default('all'),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  target_audience: 'all' | 'class_presidents';
  created_at: string;
}

// ============================================
// POLLS
// ============================================
export const insertPollSchema = z.object({
  question: z.string().min(5, "Soru en az 5 karakter olmalı"),
  options: z.array(z.string().min(1, "Seçenek boş olamaz")).min(2, "En az 2 seçenek gerekli"),
  created_by: z.string().uuid().optional(),
});

export type InsertPoll = z.infer<typeof insertPollSchema>;

export interface Poll {
  id: string;
  question: string;
  is_open: boolean;
  results_published: boolean;
  created_by?: string;
  created_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
}

// ============================================
// IDEAS
// ============================================
export const insertIdeaSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalı"),
  content: z.string().min(10, "İçerik en az 10 karakter olmalı"),
  author_id: z.string().uuid(),
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
});

export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export interface Idea {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  author_id: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// ============================================
// COMMENTS
// ============================================
export const insertCommentSchema = z.object({
  idea_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string().min(1, "Yorum boş olamaz"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

export interface Comment {
  id: string;
  idea_id: string;
  author_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  created_at: string;
}

// ============================================
// ANNOUNCEMENT COMMENTS
// ============================================
export const insertAnnouncementCommentSchema = z.object({
  announcement_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string().min(1, "Yorum boş olamaz"),
});

export type InsertAnnouncementComment = z.infer<typeof insertAnnouncementCommentSchema>;

export interface AnnouncementComment {
  id: string;
  announcement_id: string;
  author_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  created_at: string;
}

// ============================================
// BLÜTEN POSTS
// ============================================
export const insertBlutenPostSchema = z.object({
  instagram_url: z.string().url("Geçerli bir URL giriniz"),
  media_url: z.string().url().optional(),
  media_type: z.string().optional(),
  caption: z.string().optional(),
  username: z.string().optional(),
  is_visible: z.boolean().default(true),
  created_by: z.string().uuid().optional(),
  posted_at: z.string().optional(),
});

export type InsertBlutenPost = z.infer<typeof insertBlutenPostSchema>;

export interface BlutenPost {
  id: string;
  instagram_post_id?: string;
  instagram_url: string;
  media_url?: string;
  media_type?: string;
  caption?: string;
  username?: string;
  is_visible: boolean;
  created_by?: string;
  posted_at?: string;
  fetched_at: string;
}

// ============================================
// USER CREATION (For admin manual user add)
// ============================================
export const createUserSchema = z.object({
  email: z.string().email("Geçerli bir email giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  first_name: z.string().min(1, "Ad gerekli"),
  last_name: z.string().min(1, "Soyad gerekli"),
  role: z.enum(['admin', 'teacher', 'student']).default('student'),
  class_name: z.string().optional(),
  student_no: z.string().optional(),
  is_class_president: z.boolean().default(false),
});

export type CreateUser = z.infer<typeof createUserSchema>;

// ============================================
// IDEA LIKES
// ============================================
export const insertIdeaLikeSchema = z.object({
  idea_id: z.string().uuid(),
  user_id: z.string().uuid(),
});

export type InsertIdeaLike = z.infer<typeof insertIdeaLikeSchema>;

export interface IdeaLike {
  idea_id: string;
  user_id: string;
  created_at: string;
}
