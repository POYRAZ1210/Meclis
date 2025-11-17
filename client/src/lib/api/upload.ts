import { supabase } from '@/lib/supabase';

export async function uploadFile(file: File): Promise<{ url: string; type: 'image' | 'video' }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Dosya yüklenirken hata oluştu');
  }

  return res.json();
}
