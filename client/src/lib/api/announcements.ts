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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyuru güncellenirken hata oluştu');
  }

  return res.json();
}

export async function deleteAnnouncement(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyuru silinirken hata oluştu');
  }
}
