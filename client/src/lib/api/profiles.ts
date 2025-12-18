import { supabase } from '../supabase';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'teacher' | 'student';
  class_name: string | null;
  student_no: string | null;
  gender: string | null;
  profile_picture_url?: string | null;
  created_at: string;
}

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function getProfiles(className?: string): Promise<Profile[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (className && className !== 'Tümü') {
    params.append('className', className);
  }
  
  const url = `/api/profiles${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profiller yüklenirken hata oluştu');
  }
  
  return res.json();
}

export async function getProfile(): Promise<Profile> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/profiles/me', { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profil yüklenirken hata oluştu');
  }
  
  return res.json();
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/profiles/me', {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profil güncellenirken hata oluştu');
  }
  
  return res.json();
}

export async function getClassNames(): Promise<string[]> {
  const res = await fetch('/api/classes');
  if (!res.ok) {
    throw new Error('Sınıflar yüklenirken hata oluştu');
  }
  const classes = await res.json();
  return classes.map((c: { name: string }) => c.name);
}

export interface SchoolClass {
  id: string;
  name: string;
  created_at: string;
}

export async function getClasses(): Promise<SchoolClass[]> {
  const res = await fetch('/api/classes');
  if (!res.ok) {
    throw new Error('Sınıflar yüklenirken hata oluştu');
  }
  return res.json();
}

export async function createClass(name: string): Promise<SchoolClass> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/classes', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sınıf oluşturulurken hata oluştu');
  }
  return res.json();
}

export async function deleteClass(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/classes/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sınıf silinirken hata oluştu');
  }
}

export async function getAdminProfiles(className?: string): Promise<Profile[]> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (className && className !== 'Tümü') {
    params.append('className', className);
  }
  
  const url = `/api/admin/profiles${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { headers, credentials: 'include' });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profiller yüklenirken hata oluştu');
  }

  return res.json();
}
