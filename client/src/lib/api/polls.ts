import { supabase } from '../supabase';

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
}

export interface Poll {
  id: string;
  question: string;
  created_by: string;
  is_open: boolean;
  created_at: string;
  options: PollOption[];
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
}

export async function getPolls() {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Poll[];
}

export async function getPoll(id: string) {
  const { data, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Poll;
}

export async function getPollVotes(pollId: string) {
  const { data, error } = await supabase
    .from('poll_votes')
    .select('*')
    .eq('poll_id', pollId);

  if (error) throw error;
  return data as PollVote[];
}

export async function getUserVote(pollId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('poll_votes')
    .select('*')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data as PollVote | null;
}

export async function votePoll(pollId: string, optionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const { data, error } = await supabase
    .from('poll_votes')
    .insert([{ poll_id: pollId, option_id: optionId, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createPoll(question: string, options: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert([{ question, created_by: user.id }])
    .select()
    .single();

  if (pollError) throw pollError;

  const optionsData = options.map(text => ({
    poll_id: poll.id,
    option_text: text
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionsData);

  if (optionsError) throw optionsError;

  return poll;
}

export async function closePoll(pollId: string) {
  const { data, error } = await supabase
    .from('polls')
    .update({ is_open: false })
    .eq('id', pollId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
