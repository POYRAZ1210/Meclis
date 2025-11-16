import { supabase } from '../supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Announcement[];
}

export async function getAnnouncement(id: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      author:profiles!announcements_author_id_fkey(first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Announcement;
}

export async function createAnnouncement(title: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const { data, error } = await supabase
    .from('announcements')
    .insert([{ title, content, author_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAnnouncement(id: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
