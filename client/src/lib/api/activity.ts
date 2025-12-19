import { supabase } from '../supabase';
import type { ActionLog } from '@shared/schema';

interface ActivityLogResponse {
  logs: ActionLog[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchActivityLog(): Promise<ActionLog[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Authentication required');
  }

  const response = await fetch('/api/activity-log', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch activity log');
  }

  const data: ActivityLogResponse = await response.json();
  return data.logs;
}
