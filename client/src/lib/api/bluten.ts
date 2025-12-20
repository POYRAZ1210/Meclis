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
  const res = await fetch('/api/bluten', {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bülten içerikleri yüklenirken hata oluştu');
  }

  return res.json() as Promise<BlutenPost[]>;
}

export async function getAllBlutenPosts(): Promise<BlutenPost[]> {
  return getAdminBlutenPosts();
}

export async function createBlutenPost(postData: {
  instagram_url: string;
  caption?: string;
  media_url?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/bluten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(postData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bülten paylaşımı oluşturulamadı');
  }

  return res.json();
}

export async function updateBlutenPost(
  id: string,
  updates: { caption?: string; is_visible?: boolean }
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/bluten/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bülten paylaşımı güncellenemedi');
  }

  return res.json();
}

export async function deleteBlutenPost(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/bluten/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bülten paylaşımı silinemedi');
  }
}

export async function toggleBlutenVisibility(id: string, is_visible: boolean) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/bluten/${id}/visibility`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ visible: is_visible }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Görünürlük değiştirilemedi');
  }

  return res.json();
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
