import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PieChartItem {
  name: string;
  value: number;
  color: string;
}

interface TypeConfig {
  label: string;
  color: string;
}

const FEEDBACK_TYPE_CONFIG: Record<string, TypeConfig> = {
  elogio: { label: 'Elogio', color: '#1E5FA8' },
  sugestao: { label: 'Sugestão', color: '#3B82F6' },
  problema: { label: 'Problema', color: '#60A5FA' },
  reclamacao: { label: 'Reclamação', color: '#93C5FD' },
};

const DEFAULT_COLOR = '#CBD5E1';

interface UseFeedbackByTypeReturn {
  data: PieChartItem[];
  loading: boolean;
}

export function useFeedbackByType(): UseFeedbackByTypeReturn {
  const [data, setData] = useState<PieChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: rows, error } = await supabase
      .from('v_feedback_by_type')
      .select('classified_type, total');

    if (error) {
      console.error('Error fetching feedback by type:', error);
      setLoading(false);
      return;
    }

    const formattedData = mapToPieChartItems(rows ?? []);
    setData(formattedData);
    setLoading(false);
  }

  return { data, loading };
}

function mapToPieChartItems(rows: { classified_type: string; total: number }[]): PieChartItem[] {
  return rows.map(row => {
    const config = FEEDBACK_TYPE_CONFIG[row.classified_type];
    
    return {
      name: config?.label ?? row.classified_type,
      value: row.total,
      color: config?.color ?? DEFAULT_COLOR,
    };
  });
}
