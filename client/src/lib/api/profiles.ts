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
  created_at: string;
}

export async function getProfiles(className?: string) {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('class_name', { ascending: true })
    .order('student_no', { ascending: true });

  if (className && className !== 'Tümü') {
    query = query.eq('class_name', className);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getClassNames() {
  // Get classes from the classes table
  const res = await fetch('/api/classes');
  if (!res.ok) {
    throw new Error('Sınıflar yüklenirken hata oluştu');
  }
  const classes = await res.json();
  return classes.map((c: { name: string }) => c.name) as string[];
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
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sınıf oluşturulurken hata oluştu');
  }
  return res.json();
}

export async function deleteClass(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/classes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sınıf silinirken hata oluştu');
  }
}

export async function getAdminProfiles(className?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  // Build query string with optional className filter
  const params = new URLSearchParams();
  if (className && className !== 'Tümü') {
    params.append('className', className);
  }
  
  const url = `/api/admin/profiles${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Profiller yüklenirken hata oluştu');
  }

  return res.json() as Promise<Profile[]>;
}
