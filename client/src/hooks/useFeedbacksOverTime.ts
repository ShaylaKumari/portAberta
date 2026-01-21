import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FeedbackTimePoint {
  date: string;
  value: number;
}

interface UseFeedbacksOverTimeReturn {
  data: FeedbackTimePoint[];
  loading: boolean;
}

export function useFeedbacksOverTime(): UseFeedbacksOverTimeReturn {
  const [data, setData] = useState<FeedbackTimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: rows, error } = await supabase
      .from('v_feedback_last_week')
      .select('day, total_feedbacks')
      .order('day', { ascending: true });

    if (error) {
      console.error('Error fetching feedbacks over time:', error);
      setLoading(false);
      return;
    }

    const formattedData = mapToTimePoints(rows ?? []);
    setData(formattedData);
    setLoading(false);
  }

  return { data, loading };
}

function mapToTimePoints(rows: { day: string; total_feedbacks: number }[]): FeedbackTimePoint[] {
  return rows.map(row => ({
    date: row.day,
    value: row.total_feedbacks,
  }));
}
