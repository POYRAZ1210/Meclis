import { supabase } from '../supabase';

export interface Comment {
  id: string;
  idea_id: string;
  author_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  created_at: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export async function getCommentsByIdea(ideaId: string): Promise<Comment[]> {
  const res = await fetch(`/api/ideas/${ideaId}/comments`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorumlar yüklenirken hata oluştu');
  }

  return res.json() as Promise<Comment[]>;
}

export async function createComment(ideaId: string, content: string, isAnonymous: boolean = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/ideas/${ideaId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content, is_anonymous: isAnonymous }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorum oluşturulamadı');
  }

  return res.json();
}

export async function approveComment(commentId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/comments/${commentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status: 'approved' }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorum onaylanamadı');
  }

  return res.json();
}

export async function rejectComment(commentId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/comments/${commentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status: 'rejected' }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorum reddedilemedi');
  }

  return res.json();
}

export async function deleteComment(commentId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorum silinemedi');
  }
}

export async function getPendingComments(): Promise<Comment[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/comments', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Bekleyen yorumlar yüklenirken hata oluştu');
  }

  return res.json() as Promise<Comment[]>;
}
