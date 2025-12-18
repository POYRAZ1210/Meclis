import { supabase } from '../supabase';

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count?: number;
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

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function getPolls(): Promise<Poll[]> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/polls', { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylamalar yüklenirken hata oluştu');
  }
  
  return res.json();
}

export async function getPoll(id: string): Promise<Poll> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/polls/${id}`, { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama yüklenirken hata oluştu');
  }
  
  return res.json();
}

export async function getUserVote(pollId: string): Promise<PollVote | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/polls/${pollId}/my-vote`, { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oy bilgisi yüklenirken hata oluştu');
  }
  
  return res.json();
}

export async function votePoll(pollId: string, optionId: string): Promise<PollVote> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/polls/${pollId}/vote`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ option_id: optionId }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oy verilirken hata oluştu');
  }
  
  return res.json();
}

export async function deletePoll(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/polls/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama silinirken hata oluştu');
  }
}

export async function togglePollStatus(id: string, isOpen: boolean): Promise<Poll> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/polls/${id}/status`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: JSON.stringify({ is_open: isOpen }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama durumu güncellenirken hata oluştu');
  }

  return res.json();
}

export async function getAdminPolls(): Promise<Poll[]> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/polls', { headers, credentials: 'include' });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylamalar yüklenirken hata oluştu');
  }

  return res.json();
}

export async function publishPollResults(id: string): Promise<Poll> {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/admin/polls/${id}/publish-results`, {
    method: 'PATCH',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Sonuçlar yayınlanırken hata oluştu');
  }

  return res.json();
}

export async function createPoll(question: string, options: string[]): Promise<Poll> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/polls', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ question, options }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Oylama oluşturulurken hata oluştu');
  }

  return res.json();
}
