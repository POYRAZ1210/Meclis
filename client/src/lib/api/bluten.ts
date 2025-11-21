import { supabase } from '../supabase';

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

export async function getBlutenPosts(): Promise<BlutenPost[]> {
  const { data, error } = await supabase
    .from('bluten_posts')
    .select('*')
    .eq('is_visible', true)
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data as BlutenPost[];
}

export async function getAllBlutenPosts(): Promise<BlutenPost[]> {
  const { data, error } = await supabase
    .from('bluten_posts')
    .select('*')
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data as BlutenPost[];
}

export async function createBlutenPost(postData: {
  instagram_url: string;
  caption?: string;
  media_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  // Get profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('bluten_posts')
    .insert([{
      instagram_url: postData.instagram_url,
      caption: postData.caption,
      media_url: postData.media_url,
      created_by: profile?.id,
      is_visible: true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlutenPost(
  id: string,
  updates: { caption?: string; is_visible?: boolean }
) {
  const { data, error } = await supabase
    .from('bluten_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlutenPost(id: string) {
  const { error } = await supabase
    .from('bluten_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleBlutenVisibility(id: string, is_visible: boolean) {
  return updateBlutenPost(id, { is_visible });
}

export async function triggerInstagramSync(): Promise<{ count: number }> {
  const response = await fetch('/api/instagram/sync', {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to trigger Instagram sync');
  }
  
  return response.json();
}

export async function getAdminBlutenPosts(): Promise<BlutenPost[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/bluten', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bülten içerikleri yüklenirken hata oluştu');
  }

  return res.json() as Promise<BlutenPost[]>;
}
