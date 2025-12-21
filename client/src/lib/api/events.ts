import { supabase } from '../supabase';
import type { Event, InsertEvent, UpdateEvent, EventApplication, FormField } from '@shared/schema';

export async function getAdminEvents(): Promise<Event[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/events', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlikler yüklenirken hata oluştu');
  }
  return res.json();
}

export async function createEvent(data: {
  name: string;
  description?: string;
  is_active?: boolean;
  event_date?: string;
  end_date?: string;
  form_fields?: FormField[];
}): Promise<Event> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlik oluşturulurken hata oluştu');
  }
  return res.json();
}

export async function updateEvent(id: string, data: {
  name?: string;
  description?: string;
  is_active?: boolean;
  event_date?: string | null;
  end_date?: string | null;
  form_fields?: FormField[];
}): Promise<Event> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/events/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlik güncellenirken hata oluştu');
  }
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlik silinirken hata oluştu');
  }
}

export interface EventApplicationWithProfile extends EventApplication {
  profile?: {
    first_name: string | null;
    last_name: string | null;
    class_name: string | null;
    student_no: string | null;
    user_id: string;
  };
}

export async function getEventApplications(eventId: string): Promise<EventApplicationWithProfile[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/events/${eventId}/applications`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Başvurular yüklenirken hata oluştu');
  }
  return res.json();
}

// ============================================
// STUDENT-FACING API FUNCTIONS
// ============================================

export interface EventWithStatus extends Event {
  has_applied?: boolean;
}

export async function getEvents(): Promise<EventWithStatus[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/events', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlikler yüklenirken hata oluştu');
  }
  return res.json();
}

export async function getEventDetails(id: string): Promise<EventWithStatus> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/events/${id}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Etkinlik detayları yüklenirken hata oluştu');
  }
  return res.json();
}

export async function applyToEvent(id: string, responses: Record<string, string>): Promise<EventApplication> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/events/${id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ responses }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Başvuru gönderilirken hata oluştu');
  }
  return res.json();
}
