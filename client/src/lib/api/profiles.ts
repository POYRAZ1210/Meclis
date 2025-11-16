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
  const { data, error } = await supabase
    .from('profiles')
    .select('class_name')
    .not('class_name', 'is', null)
    .order('class_name');

  if (error) throw error;
  
  const uniqueClasses = [...new Set(data.map(p => p.class_name).filter(Boolean))];
  return uniqueClasses as string[];
}
