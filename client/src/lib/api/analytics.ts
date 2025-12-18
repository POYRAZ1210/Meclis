import { supabase } from '../supabase';

export interface PollAnalytics {
  id: string;
  question: string;
  isOpen: boolean;
  resultsPublished: boolean;
  createdAt: string;
  totalVotes: number;
  uniqueVoters: number;
  participationRate: number;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
}

export interface AnalyticsOverview {
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  totalPolls: number;
  activePolls: number;
  closedPolls: number;
  totalVotes: number;
  uniqueVoters: number;
  participationRate: number;
  totalIdeas: number;
  approvedIdeas: number;
  pendingIdeas: number;
  rejectedIdeas: number;
  totalAnnouncements: number;
  totalComments: number;
  approvedComments: number;
  totalEvents: number;
  activeEvents: number;
  totalApplications: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  polls: PollAnalytics[];
  classDistribution: Record<string, number>;
  votesByClass: Record<string, number>;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Giriş yapmanız gerekiyor');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/admin/analytics', { headers, credentials: 'include' });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Analiz verileri yüklenirken hata oluştu');
  }
  
  return res.json();
}
