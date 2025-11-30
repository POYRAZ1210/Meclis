import { supabase } from '../supabase';
import type { Idea } from '@shared/schema';

export async function getIdeas() {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch('/api/ideas', {
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch ideas');
  }

  return res.json() as Promise<Idea[]>;
}

export async function getIdea(id: string) {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`/api/ideas/${id}`, {
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch idea');
  }

  return res.json();
}

export async function createIdea(data: { 
  title: string; 
  content: string; 
  imageUrl?: string; 
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentType?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  // Map frontend field names to backend schema
  const payload = {
    title: data.title,
    content: data.content,
    image_url: data.imageUrl,
    video_url: data.videoUrl,
    attachment_url: data.attachmentUrl,
    attachment_type: data.attachmentType,
  };

  const res = await fetch('/api/ideas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create idea');
  }

  return res.json();
}

export async function toggleLike(ideaId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/ideas/${ideaId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to toggle like');
  }

  return res.json();
}

export async function addComment(ideaId: string, content: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/ideas/${ideaId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  return res.json();
}

export async function editComment(commentId: string, content: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Yorum düzenlenirken hata oluştu');
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
    throw new Error(error.error || 'Yorum silinirken hata oluştu');
  }

  return res.json();
}

// Admin functions
export async function getAdminIdeas() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/ideas', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch admin ideas');
  }

  return res.json();
}

export async function updateIdeaStatus(id: string, status: 'approved' | 'rejected') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/ideas/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update idea status');
  }

  return res.json();
}

export async function getAdminComments() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/comments', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch admin comments');
  }

  return res.json();
}

export async function updateCommentStatus(id: string, status: 'approved' | 'rejected') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/comments/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update comment status');
  }

  return res.json();
}

export async function deleteIdea(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/ideas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete idea');
  }

  return res.json();
}
