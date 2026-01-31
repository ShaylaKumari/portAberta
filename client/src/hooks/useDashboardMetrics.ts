import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useDashboardFilters, DashboardFilters, DateRange } from '@/contexts/DashboardFiltersContext';
import { useCompany } from '@/hooks/useCompany';

export type Trend = 'up' | 'down' | 'stable';

export interface DashboardMetrics {
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  positiveRate: number;
  trend: Trend;
  criticalFeedbacks: number;
}

interface FeedbackAnalysisRow {
  id: string;
  feedback_id: string;
  company_slug: string;
  department: string;
  sentiment: string;
  classified_type: string;
  main_theme: string;
  criticality: string;
  created_at: string;
}

const INITIAL_METRICS: DashboardMetrics = {
  totalFeedbacks: 0,
  positiveFeedbacks: 0,
  negativeFeedbacks: 0,
  neutralFeedbacks: 0,
  positiveRate: 0,
  trend: 'stable',
  criticalFeedbacks: 0,
};

function applyFiltersToQuery(
  query: ReturnType<typeof supabase.from>,
  filters: DashboardFilters,
  dateRange: DateRange,
  companySlug: string
) {
  // Filtro obrigatório: empresa
  let filteredQuery = query.eq('company_slug', companySlug);

  if (dateRange.start) {
    filteredQuery = filteredQuery.gte('created_at', dateRange.start.toISOString());
  }
  if (dateRange.end) {
    filteredQuery = filteredQuery.lte('created_at', dateRange.end.toISOString());
  }

  if (filters.categories.length > 0) {
    filteredQuery = filteredQuery.in('classified_type', filters.categories);
  }

  if (filters.criticalities.length > 0) {
    filteredQuery = filteredQuery.in('criticality', filters.criticalities);
  }

  if (filters.sentiments.length > 0) {
    filteredQuery = filteredQuery.in('sentiment', filters.sentiments);
  }

  if (filters.themes.length > 0) {
    filteredQuery = filteredQuery.in('main_theme', filters.themes);
  }

  if (filters.departments.length > 0) {
    filteredQuery = filteredQuery.in('department', filters.departments);
  }

  return filteredQuery;
}

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  const fetchMetrics = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query direta na tabela feedback_analysis com filtros dinâmicos
      let query = supabase
        .from('feedback_analysis')
        .select('id, sentiment, classified_type, criticality, main_theme, department, created_at');

      query = applyFiltersToQuery(query, filters, computedDateRange, companySlug);

      const { data: rows, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      const metrics = calculateMetricsFromRows(rows ?? []);
      setData(metrics);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(INITIAL_METRICS);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

function calculateMetricsFromRows(rows: FeedbackAnalysisRow[]): DashboardMetrics {
  const total = rows.length;

  if (total === 0) {
    return INITIAL_METRICS;
  }

  // Contagem por sentimento
  const sentimentCounts = rows.reduce(
    (acc, row) => {
      const sentiment = row.sentiment?.toLowerCase() ?? 'neutro';
      if (sentiment === 'positivo') acc.positive++;
      else if (sentiment === 'negativo') acc.negative++;
      else acc.neutral++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  // Taxa positiva
  const positiveRate = total > 0 
    ? Math.round((sentimentCounts.positive / total) * 100) 
    : 0;

  // Contagem de feedbacks críticos (criticality === 'alta')
  const criticalFeedbacks = rows.filter(
    row => row.criticality?.toLowerCase() === 'alta'
  ).length;

  // Cálculo de tendência (comparando primeira e segunda metade do período)
  const trend = calculateTrendFromRows(rows);

  return {
    totalFeedbacks: total,
    positiveFeedbacks: sentimentCounts.positive,
    negativeFeedbacks: sentimentCounts.negative,
    neutralFeedbacks: sentimentCounts.neutral,
    positiveRate,
    trend,
    criticalFeedbacks,
  };
}

function calculateTrendFromRows(rows: FeedbackAnalysisRow[]): Trend {
  if (rows.length < 4) return 'stable';

  // Ordena por data
  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstHalfPositiveRate = calculatePositiveRate(firstHalf);
  const secondHalfPositiveRate = calculatePositiveRate(secondHalf);

  const diff = secondHalfPositiveRate - firstHalfPositiveRate;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

function calculatePositiveRate(rows: FeedbackAnalysisRow[]): number {
  if (rows.length === 0) return 0;
  const positiveCount = rows.filter(r => r.sentiment?.toLowerCase() === 'positivo').length;
  return (positiveCount / rows.length) * 100;
}

export interface TimeSeriesDataPoint {
  date: string;
  label: string;
  value: number;
  positivo: number;
  negativo: number;
  neutro: number;
}

export function useFeedbacksOverTimeFiltered() {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  // Determina se deve agrupar por semana (período > 30 dias)
  const shouldGroupByWeek = useMemo(() => {
    if (!computedDateRange.start || !computedDateRange.end) return false;
    const diffDays = Math.ceil(
      (computedDateRange.end.getTime() - computedDateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 30;
  }, [computedDateRange]);

  const fetchData = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('feedback_analysis')
        .select('id, sentiment, created_at')
        .order('created_at', { ascending: true });

      query = applyFiltersToQuery(query, filters, computedDateRange, companySlug);

      const { data: rows, error } = await query;

      if (error) throw error;

      const aggregated = aggregateByTime(rows ?? [], shouldGroupByWeek);
      setData(aggregated);
    } catch (err) {
      console.error('Error fetching feedbacks over time:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange, shouldGroupByWeek]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, shouldGroupByWeek };
}

function aggregateByTime(
  rows: { id: string; sentiment: string; created_at: string }[],
  groupByWeek: boolean
): TimeSeriesDataPoint[] {
  const grouped = new Map<string, { positivo: number; negativo: number; neutro: number }>();

  rows.forEach(row => {
    const date = new Date(row.created_at);
    let key: string;
    let label: string;

    if (groupByWeek) {
      // Agrupa por semana (início da semana)
      const weekStart = getWeekStart(date);
      key = weekStart.toISOString().split('T')[0];
      label = `Sem ${formatWeekLabel(weekStart)}`;
    } else {
      // Agrupa por dia
      key = date.toISOString().split('T')[0];
      label = formatDayLabel(date);
    }

    if (!grouped.has(key)) {
      grouped.set(key, { positivo: 0, negativo: 0, neutro: 0 });
    }

    const counts = grouped.get(key)!;
    const sentiment = row.sentiment?.toLowerCase() ?? 'neutro';
    if (sentiment === 'positivo') counts.positivo++;
    else if (sentiment === 'negativo') counts.negativo++;
    else counts.neutro++;
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      label: groupByWeek ? `Sem ${formatWeekLabel(new Date(date))}` : formatDayLabel(new Date(date)),
      value: counts.positivo + counts.negativo + counts.neutro,
      ...counts,
    }));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

function formatDayLabel(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

export interface CriticalityWeekData {
  week: string;
  label: string;
  criticos: number;
}

export function useCriticalityByWeek() {
  const [data, setData] = useState<CriticalityWeekData[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  const fetchData = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('feedback_analysis')
        .select('id, criticality, created_at')
        .order('created_at', { ascending: true });

      query = applyFiltersToQuery(query, filters, computedDateRange, companySlug);

      const { data: rows, error } = await query;

      if (error) throw error;

      const aggregated = aggregateCriticalityByWeek(rows ?? []);
      setData(aggregated);
    } catch (err) {
      console.error('Error fetching criticality by week:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}

function aggregateCriticalityByWeek(
  rows: { id: string; criticality: string; created_at: string }[]
): CriticalityWeekData[] {
  const grouped = new Map<string, number>();

  rows.forEach(row => {
    const date = new Date(row.created_at);
    const weekStart = getWeekStart(date);
    const key = weekStart.toISOString().split('T')[0];

    if (!grouped.has(key)) {
      grouped.set(key, 0);
    }

    // Conta apenas feedbacks com criticidade alta
    const criticality = row.criticality?.toLowerCase() ?? 'baixa';
    if (criticality === 'alta') {
      grouped.set(key, grouped.get(key)! + 1);
    }
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, criticos]) => ({
      week,
      label: `Sem ${formatWeekLabel(new Date(week))}`,
      criticos,
    }));
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positivo: '#B2D8B2',
  neutro:   '#D5D7DA',
  negativo: '#FFADAD',
};


const CATEGORY_COLORS: Record<string, string> = {
  elogio:     '#B2D8B2',
  sugestao:   '#A2D2FF',
  problema:   '#FFADAD',
  reclamacao: '#e7be8b', 
};


export function useSentimentDistribution() {
  const [data, setData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  const fetchData = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('feedback_analysis')
        .select('id, sentiment');

      query = applyFiltersToQuery(query, filters, computedDateRange, companySlug);

      const { data: rows, error } = await query;

      if (error) throw error;

      const distribution = calculateDistribution(
        rows ?? [],
        'sentiment',
        SENTIMENT_COLORS,
        { positivo: 'Positivo', neutro: 'Neutro', negativo: 'Negativo' }
      );
      setData(distribution);
    } catch (err) {
      console.error('Error fetching sentiment distribution:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}

export function useCategoryDistribution() {
  const [data, setData] = useState<PieChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  const fetchData = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('feedback_analysis')
        .select('id, classified_type');

      query = applyFiltersToQuery(query, filters, computedDateRange, companySlug);

      const { data: rows, error } = await query;

      if (error) throw error;

      const distribution = calculateDistribution(
        rows ?? [],
        'classified_type',
        CATEGORY_COLORS,
        { elogio: 'Elogio', sugestao: 'Sugestão', problema: 'Problema', reclamacao: 'Reclamação' }
      );
      setData(distribution);
    } catch (err) {
      console.error('Error fetching category distribution:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading };
}

function calculateDistribution(
  rows: Record<string, unknown>[],
  field: string,
  colors: Record<string, string>,
  labels: Record<string, string>
): PieChartData[] {
  const counts = new Map<string, number>();

  rows.forEach(row => {
    const value = (row[field] as string)?.toLowerCase() ?? 'outros';
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: labels[key] ?? key,
      value: count,
      color: colors[key] ?? '#CBD5E1',
    }))
    .sort((a, b) => b.value - a.value);
}

export interface FilteredFeedback {
  id: string;
  company_slug: string;
  department: string;
  main_theme: string;
  classified_type: string;
  sentiment: string;
  criticality: string;
  executive_summary: string | null;
  feedback: string;
  created_at: string;
}

export function useRecentFeedbacksFiltered(limit = 10) {
  const [feedbacks, setFeedbacks] = useState<FilteredFeedback[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const { filters, computedDateRange } = useDashboardFilters();
  const { company } = useCompany();

  const companySlug = company?.slug ?? '';

  const fetchData = useCallback(async () => {
    if (!companySlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Primeiro, buscar os IDs de feedback_analysis que atendem aos filtros
      let analysisQuery = supabase
        .from('feedback_analysis')
        .select('feedback_id, sentiment, classified_type, criticality, main_theme, department, executive_summary, created_at')
        .order('created_at', { ascending: false })
        .limit(limit + 1);

      analysisQuery = applyFiltersToQuery(analysisQuery, filters, computedDateRange, companySlug);

      const { data: analysisRows, error: analysisError } = await analysisQuery;

      if (analysisError) throw analysisError;

      if (!analysisRows || analysisRows.length === 0) {
        setFeedbacks([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const feedbackIds = analysisRows.map(r => r.feedback_id);

      // Buscar os feedbacks raw correspondentes
      const { data: rawRows, error: rawError } = await supabase
        .from('feedback_raw')
        .select('id, feedback')
        .in('id', feedbackIds);

      if (rawError) throw rawError;

      // Combinar os dados
      const rawMap = new Map(rawRows?.map(r => [r.id, r.feedback]) ?? []);

      const combined: FilteredFeedback[] = analysisRows.slice(0, limit).map(analysis => ({
        id: analysis.feedback_id,
        company_slug: companySlug,
        department: analysis.department ?? '',
        main_theme: analysis.main_theme ?? '',
        classified_type: analysis.classified_type ?? '',
        sentiment: analysis.sentiment ?? '',
        criticality: analysis.criticality ?? '',
        executive_summary: analysis.executive_summary,
        feedback: rawMap.get(analysis.feedback_id) ?? '',
        created_at: analysis.created_at,
      }));

      setFeedbacks(combined);
      setHasMore(analysisRows.length > limit);
    } catch (err) {
      console.error('Error fetching filtered feedbacks:', err);
      setFeedbacks([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [companySlug, filters, computedDateRange, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { feedbacks, hasMore, loading };
}

export function useAvailableThemes() {
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { company } = useCompany();
  const companySlug = company?.slug ?? '';

  useEffect(() => {
    async function fetchThemes() {
      if (!companySlug) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('feedback_analysis')
          .select('main_theme')
          .eq('company_slug', companySlug)
          .not('main_theme', 'is', null);

        if (error) throw error;

        const uniqueThemes = [...new Set(data?.map(r => r.main_theme).filter(Boolean) ?? [])];
        setThemes(uniqueThemes.sort());
      } catch (err) {
        console.error('Error fetching themes:', err);
        setThemes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchThemes();
  }, [companySlug]);

  return { themes, loading };
}