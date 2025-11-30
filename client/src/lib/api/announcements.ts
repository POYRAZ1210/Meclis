import { supabase } from '../supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_audience: 'all' | 'class_presidents';
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export async function getAnnouncements() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const res = await fetch('/api/announcements', {
    headers: session ? {
      'Authorization': `Bearer ${session.access_token}`,
    } : {},
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyurular yüklenirken hata oluştu');
  }

  return res.json() as Promise<Announcement[]>;
}

export async function getAnnouncement(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const res = await fetch(`/api/announcements/${id}`, {
    headers: session ? {
      'Authorization': `Bearer ${session.access_token}`,
    } : {},
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyuru yüklenirken hata oluştu');
  }

  return res.json() as Promise<Announcement>;
}

export async function createAnnouncement(title: string, content: string, targetAudience: 'all' | 'class_presidents' = 'all') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ title, content, target_audience: targetAudience }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyuru oluşturulurken hata oluştu');
  }

  return res.json();
}

export async function updateAnnouncement(id: string, title: string, content: string, targetAudience?: 'all' | 'class_presidents') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const body: any = { title, content };
  if (targetAudience) {
    body.target_audience = targetAudience;
  }

  const res = await fetch(`/api/admin/announcements/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(body),
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

export async function getAdminAnnouncements() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/announcements', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Duyurular yüklenirken hata oluştu');
  }

  return res.json() as Promise<Announcement[]>;
}

// Announcement Comments
export async function getAnnouncementComments(announcementId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/announcements/${announcementId}/comments`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch comments');
  }

  return res.json();
}

export async function addAnnouncementComment(announcementId: string, content: string, parentId?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/announcements/${announcementId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ content, parent_id: parentId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to add comment');
  }

  return res.json();
}

export async function editAnnouncementComment(commentId: string, content: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/announcement-comments/${commentId}`, {
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

export async function deleteAnnouncementComment(commentId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/announcement-comments/${commentId}`, {
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

export async function getAdminAnnouncementComments() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch('/api/admin/announcement-comments', {
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

export async function updateAnnouncementCommentStatus(id: string, status: 'approved' | 'rejected') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/announcement-comments/${id}/status`, {
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
