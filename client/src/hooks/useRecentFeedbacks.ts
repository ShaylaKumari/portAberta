import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type FeedbackType = 'elogio' | 'problema' | 'sugestao' | 'reclamacao';
type Sentiment = 'positivo' | 'neutro' | 'negativo';

export interface RecentFeedback {
  company_slug: string;
  department: string;
  main_theme: string;
  classified_type: FeedbackType;
  sentiment: Sentiment;
  criticality: string;
  executive_summary: string | null;
  feedback: string;
  date: string;
}

interface UseRecentFeedbacksReturn {
  feedbacks: RecentFeedback[];
  hasMore: boolean;
  loading: boolean;
}

const DEFAULT_LIMIT = 10;

export function useRecentFeedbacks(limit = DEFAULT_LIMIT): UseRecentFeedbacksReturn {
  const [feedbacks, setFeedbacks] = useState<RecentFeedback[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, [limit]);

  async function fetchFeedbacks() {
    const queryLimit = limit + 1;

    const { data, error } = await supabase
      .from('v_recent_feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(queryLimit);

    if (error) {
      console.error('Error fetching recent feedbacks:', error);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const hasMoreResults = rows.length > limit;
    const feedbacksToShow = rows.slice(0, limit);

    setHasMore(hasMoreResults);
    setFeedbacks(mapToRecentFeedbacks(feedbacksToShow));
    setLoading(false);
  }

  return { feedbacks, hasMore, loading };
}

function mapToRecentFeedbacks(rows: Record<string, unknown>[]): RecentFeedback[] {
  return rows.map(row => ({
    company_slug: row.company_slug as string,
    department: row.department as string,
    main_theme: row.main_theme as string,
    classified_type: row.classified_type as FeedbackType,
    sentiment: row.sentiment as Sentiment,
    criticality: row.criticality as string,
    executive_summary: row.executive_summary as string | null,
    feedback: row.feedback as string,
    date: row.created_at as string,
  }));
}
