import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Trend = 'up' | 'down' | 'stable';

interface DashboardMetrics {
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  positiveRate: number;
  trend: Trend;
}

interface SentimentData {
  sentiment: string;
  total: number;
}

interface WeeklyData {
  week: string;
  sentiment: string;
  total: number;
}

const INITIAL_METRICS: DashboardMetrics = {
  totalFeedbacks: 0,
  positiveFeedbacks: 0,
  negativeFeedbacks: 0,
  positiveRate: 0,
  trend: 'stable',
};

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    const [totalResult, sentimentResult, weeklyResult] = await Promise.all([
      supabase.from('v_feedback_total').select('total_feedbacks').single(),
      supabase.from('v_sentiment_metrics').select('sentiment, total'),
      supabase.from('v_weekly_sentiment').select('week, sentiment, total').order('week', { ascending: false }),
    ]);

    if (totalResult.error || sentimentResult.error || weeklyResult.error) {
      console.error('Error fetching metrics:', totalResult.error || sentimentResult.error || weeklyResult.error);
      setLoading(false);
      return;
    }

    const metrics = calculateMetrics(
      totalResult.data.total_feedbacks,
      sentimentResult.data ?? [],
      weeklyResult.data ?? []
    );

    setData(metrics);
    setLoading(false);
  }

  return { data, loading };
}

function calculateMetrics(
  total: number,
  sentimentData: SentimentData[],
  weeklyData: WeeklyData[]
): DashboardMetrics {
  const positiveFeedbacks = findSentimentTotal(sentimentData, 'positivo');
  const negativeFeedbacks = findSentimentTotal(sentimentData, 'negativo');
  const positiveRate = calculatePercentage(positiveFeedbacks, total);
  const trend = calculateTrend(weeklyData);

  return {
    totalFeedbacks: total,
    positiveFeedbacks,
    negativeFeedbacks,
    positiveRate,
    trend,
  };
}

function findSentimentTotal(data: SentimentData[], sentiment: string): number {
  return data.find(item => item.sentiment === sentiment)?.total ?? 0;
}

function calculatePercentage(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function calculateTrend(weeklyData: WeeklyData[]): Trend {
  const uniqueWeeks = [...new Set(weeklyData.map(item => item.week))];
  const currentWeek = uniqueWeeks[0];
  const previousWeek = uniqueWeeks[1];

  const currentRate = calculateWeeklyPositiveRate(weeklyData, currentWeek);
  const previousRate = calculateWeeklyPositiveRate(weeklyData, previousWeek);

  if (currentRate > previousRate) return 'up';
  if (currentRate < previousRate) return 'down';
  return 'stable';
}

function calculateWeeklyPositiveRate(data: WeeklyData[], week: string | undefined): number {
  if (!week) return 0;

  const weekData = data.filter(item => item.week === week);
  const totalWeek = weekData.reduce((sum, item) => sum + item.total, 0);
  const positiveWeek = weekData.find(item => item.sentiment === 'positivo')?.total ?? 0;

  return calculatePercentage(positiveWeek, totalWeek);
}
