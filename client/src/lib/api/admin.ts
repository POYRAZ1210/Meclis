import { supabase } from '../supabase';
import type { Profile, CreateUser } from '@shared/schema';

export async function getUsers() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/users', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Kullanıcılar yüklenirken hata oluştu');
  }

  return res.json() as Promise<Profile[]>;
}

export async function createUser(data: CreateUser) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Kullanıcı oluşturulurken hata oluştu');
  }

  return res.json() as Promise<Profile>;
}

export async function updateUser(id: string, data: Partial<Profile>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Kullanıcı güncellenirken hata oluştu');
  }

  return res.json() as Promise<Profile>;
}

export async function deleteUser(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Kullanıcı silinirken hata oluştu');
  }
}

export async function getPendingProfilePictures() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/profile-pictures', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profil fotoğrafları yüklenirken hata oluştu');
  }

  return res.json() as Promise<Profile[]>;
}

export async function approveProfilePicture(profileId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/profile-pictures/${profileId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profil fotoğrafı onaylanırken hata oluştu');
  }

  return res.json() as Promise<Profile>;
}

export async function rejectProfilePicture(profileId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/profile-pictures/${profileId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profil fotoğrafı reddedilirken hata oluştu');
  }

  return res.json() as Promise<Profile>;
}
