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
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(first_name, last_name)
    `)
    .eq('idea_id', ideaId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Comment[];
}

export async function createComment(ideaId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  // Get profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      idea_id: ideaId,
      author_id: profile?.id,
      content,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function approveComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  // Get profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('comments')
    .update({
      status: 'approved',
      reviewed_by: profile?.id,
    })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  // Get profile id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('comments')
    .update({
      status: 'rejected',
      reviewed_by: profile?.id,
    })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

export async function getPendingComments(): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(first_name, last_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Comment[];
}
