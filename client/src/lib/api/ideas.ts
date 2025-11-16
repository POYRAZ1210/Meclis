import { supabase } from '../supabase';

export type IdeaStatus = 'pending' | 'approved' | 'rejected';

export interface Idea {
  id: string;
  title: string;
  body: string;
  author_id: string;
  status: IdeaStatus;
  created_at: string;
  approved_at: string | null;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface IdeaComment {
  id: string;
  idea_id: string;
  author_id: string;
  body: string;
  status: IdeaStatus;
  created_at: string;
  approved_at: string | null;
  author?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export async function getIdeas(status?: IdeaStatus) {
  let query = supabase
    .from('ideas')
    .select(`
      *,
      author:profiles!ideas_author_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Idea[];
}

export async function getIdea(id: string) {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      *,
      author:profiles!ideas_author_id_fkey(first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Idea;
}

export async function createIdea(title: string, body: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const { data, error } = await supabase
    .from('ideas')
    .insert([{ title, body, author_id: user.id, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIdeaStatus(id: string, status: IdeaStatus) {
  const updateData: any = { status };
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getIdeaComments(ideaId: string) {
  const { data, error } = await supabase
    .from('ideas_comments')
    .select(`
      *,
      author:profiles!ideas_comments_author_id_fkey(first_name, last_name)
    `)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as IdeaComment[];
}

export async function createIdeaComment(ideaId: string, body: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const { data, error } = await supabase
    .from('ideas_comments')
    .insert([{ idea_id: ideaId, body, author_id: user.id, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCommentStatus(id: string, status: IdeaStatus) {
  const updateData: any = { status };
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('ideas_comments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
