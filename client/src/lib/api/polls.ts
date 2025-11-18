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
  results_published: boolean;
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
  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(
        id,
        poll_id,
        option_text
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate vote counts for each option
  const pollsWithVotes = await Promise.all(
    polls.map(async (poll) => {
      const optionsWithVotes = await Promise.all(
        poll.options.map(async (option: any) => {
          const { count } = await supabase
            .from('poll_votes')
            .select('*', { count: 'exact', head: true })
            .eq('option_id', option.id);

          return {
            ...option,
            vote_count: count || 0,
          };
        })
      );

      return {
        ...poll,
        options: optionsWithVotes,
      };
    })
  );

  return pollsWithVotes as Poll[];
}

export async function getPoll(id: string) {
  const { data: poll, error } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(
        id,
        poll_id,
        option_text
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  // Calculate vote counts for each option
  const optionsWithVotes = await Promise.all(
    poll.options.map(async (option: any) => {
      const { count } = await supabase
        .from('poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('option_id', option.id);

      return {
        ...option,
        vote_count: count || 0,
      };
    })
  );

  return {
    ...poll,
    options: optionsWithVotes,
  } as Poll;
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

  // Check if poll is still open and results not published
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('is_open, results_published')
    .eq('id', pollId)
    .single();

  if (pollError) throw pollError;
  
  if (!poll.is_open) {
    throw new Error('Bu oylama kapatılmıştır');
  }
  
  if (poll.results_published) {
    throw new Error('Sonuçlar yayınlandı, artık oy veremezsiniz');
  }

  // Upsert allows changing vote
  const { data, error } = await supabase
    .from('poll_votes')
    .upsert(
      { poll_id: pollId, option_id: optionId, user_id: user.id },
      { onConflict: 'poll_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createPoll(question: string, options: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmanız gerekiyor');

  // Try to get user's profile ID, but allow null if not found
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert([{ question, created_by: profile?.id || user.id }])
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

export async function deletePoll(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/polls/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama silinirken hata oluştu');
  }
}

export async function togglePollStatus(id: string, isOpen: boolean) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/polls/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ is_open: isOpen }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama durumu güncellenirken hata oluştu');
  }

  return res.json();
}

export async function getAdminPolls() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch('/api/admin/polls', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylamalar yüklenirken hata oluştu');
  }

  return res.json();
}

export async function publishPollResults(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');

  const res = await fetch(`/api/admin/polls/${id}/publish-results`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sonuçlar yayınlanırken hata oluştu');
  }

  return res.json();
}
