import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const DEFAULT_TIME_FILTER = '7';
const DEFAULT_CATEGORY_FILTER = 'all';

interface FeedbackAnalysisItem {
  id: string;
  company_slug: string;
  classified_type: string;
  sentiment: string;
  criticality: string;
  executive_summary: string | null;
  main_theme: string | null;
  created_at: string;
}

interface UseFeedbackAnalysisReturn {
  data: FeedbackAnalysisItem[];
  loading: boolean;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}

export function useFeedbackAnalysis(companySlug: string): UseFeedbackAnalysisReturn {
  const [data, setData] = useState<FeedbackAnalysisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState(DEFAULT_TIME_FILTER);
  const [categoryFilter, setCategoryFilter] = useState(DEFAULT_CATEGORY_FILTER);

  const fetchData = useCallback(async () => {
    if (!companySlug) return;

    setLoading(true);

    const fromDate = calculateFromDate(Number(timeFilter));

    let query = supabase
      .from('feedback_analysis')
      .select('*')
      .eq('company_slug', companySlug)
      .gte('created_at', fromDate.toISOString())
      .order('created_at', { ascending: false });

    if (categoryFilter !== 'all') {
      query = query.eq('classified_type', categoryFilter);
    }

    const { data: result, error } = await query;

    if (!error) {
      setData(result ?? []);
    }

    setLoading(false);
  }, [companySlug, timeFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    timeFilter,
    setTimeFilter,
    categoryFilter,
    setCategoryFilter
  };
}

function calculateFromDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}
