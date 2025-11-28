import { z } from "zod";
import { pgTable, varchar, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================
// DRIZZLE ORM TABLE DEFINITIONS
// ============================================

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().unique(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  role: text("role").notNull().default("student"),
  class_name: text("class_name"),
  student_no: text("student_no"),
  gender: text("gender"),
  is_class_president: boolean("is_class_president").notNull().default(false),
  profile_picture_url: text("profile_picture_url"),
  profile_picture_status: text("profile_picture_status").default("approved"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author_id: varchar("author_id"),
  target_audience: text("target_audience").notNull().default("all"),
  attachment_url: text("attachment_url"),
  attachment_type: text("attachment_type"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  is_open: boolean("is_open").notNull().default(true),
  results_published: boolean("results_published").notNull().default(false),
  created_by: varchar("created_by"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const pollOptions = pgTable("poll_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poll_id: varchar("poll_id").notNull(),
  option_text: text("option_text").notNull(),
  vote_count: integer("vote_count").notNull().default(0),
});

export const pollVotes = pgTable("poll_votes", {
  user_id: varchar("user_id").notNull(),
  poll_id: varchar("poll_id").notNull(),
  option_id: varchar("option_id").notNull(),
  voted_at: timestamp("voted_at").notNull().default(sql`now()`),
});

export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"),
  author_id: varchar("author_id").notNull(),
  image_url: text("image_url"),
  video_url: text("video_url"),
  attachment_url: text("attachment_url"),
  attachment_type: text("attachment_type"),
  likes_count: integer("likes_count").notNull().default(0),
  reviewed_by: varchar("reviewed_by"),
  reviewed_at: timestamp("reviewed_at"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  idea_id: varchar("idea_id").notNull(),
  author_id: varchar("author_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"),
  reviewed_by: varchar("reviewed_by"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const announcementComments = pgTable("announcement_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  announcement_id: varchar("announcement_id").notNull(),
  author_id: varchar("author_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"),
  reviewed_by: varchar("reviewed_by"),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

export const blutenPosts = pgTable("bluten_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instagram_post_id: text("instagram_post_id"),
  instagram_url: text("instagram_url").notNull(),
  media_url: text("media_url"),
  media_type: text("media_type"),
  caption: text("caption"),
  username: text("username"),
  is_visible: boolean("is_visible").notNull().default(true),
  created_by: varchar("created_by"),
  posted_at: timestamp("posted_at"),
  fetched_at: timestamp("fetched_at").notNull().default(sql`now()`),
});

export const ideaLikes = pgTable("idea_likes", {
  idea_id: varchar("idea_id").notNull(),
  user_id: varchar("user_id").notNull(),
  created_at: timestamp("created_at").notNull().default(sql`now()`),
});

// ============================================
// ZOD SCHEMAS & TYPES
// ============================================

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

export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "Ad gerekli").optional(),
  last_name: z.string().min(1, "Soyad gerekli").optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  class_name: z.string().optional(),
  student_no: z.string().optional(),
  gender: z.string().optional(),
  is_class_president: z.boolean().optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

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
  profile_picture_url?: string;
  profile_picture_status?: 'pending' | 'approved' | 'rejected';
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
  attachment_url: z.string().optional(),
  attachment_type: z.enum(['image', 'video', 'pdf', 'document']).optional(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  target_audience: 'all' | 'class_presidents';
  attachment_url?: string;
  attachment_type?: 'image' | 'video' | 'pdf' | 'document';
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
  attachment_url: z.string().optional(),
  attachment_type: z.enum(['image', 'video', 'pdf', 'document']).optional(),
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
  attachment_url?: string;
  attachment_type?: 'image' | 'video' | 'pdf' | 'document';
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
