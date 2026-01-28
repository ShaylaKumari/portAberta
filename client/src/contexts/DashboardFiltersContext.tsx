import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type PeriodPreset = '7' | '30' | '90' | 'custom';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DashboardFilters {
  // Período
  periodPreset: PeriodPreset;
  dateRange: DateRange;
  
  // Filtros múltiplos (arrays)
  categories: string[];      // classified_type: elogio, sugestao, problema, reclamacao
  criticalities: string[];   // criticality: alta, media, baixa
  sentiments: string[];      // sentiment: positivo, neutro, negativo
  themes: string[];          // main_theme
  departments: string[];     // department (setor)
}

export interface DashboardFiltersContextType {
  filters: DashboardFilters;
  
  // Setters individuais
  setPeriodPreset: (preset: PeriodPreset) => void;
  setDateRange: (range: DateRange) => void;
  setCategories: (categories: string[]) => void;
  setCriticalities: (criticalities: string[]) => void;
  setSentiments: (sentiments: string[]) => void;
  setThemes: (themes: string[]) => void;
  setDepartments: (departments: string[]) => void;
  
  // Helpers
  toggleCategory: (category: string) => void;
  toggleCriticality: (criticality: string) => void;
  toggleSentiment: (sentiment: string) => void;
  toggleTheme: (theme: string) => void;
  toggleDepartment: (department: string) => void;
  
  // Reset
  resetFilters: () => void;
  
  // Computed
  computedDateRange: DateRange;
  hasActiveFilters: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const CATEGORY_OPTIONS = [
  { value: 'elogio', label: 'Elogio' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'problema', label: 'Problema' },
  { value: 'reclamacao', label: 'Reclamação' },
] as const;

export const CRITICALITY_OPTIONS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
] as const;

export const SENTIMENT_OPTIONS = [
  { value: 'positivo', label: 'Positivo' },
  { value: 'neutro', label: 'Neutro' },
  { value: 'negativo', label: 'Negativo' },
] as const;

export const PERIOD_OPTIONS = [
  { value: '7' as PeriodPreset, label: 'Últimos 7 dias' },
  { value: '30' as PeriodPreset, label: 'Últimos 30 dias' },
  { value: '90' as PeriodPreset, label: 'Últimos 90 dias' },
  { value: 'custom' as PeriodPreset, label: 'Personalizado' },
] as const;

export const DEPARTMENT_OPTIONS = [
  { value: 'Administrativo/Gestão', label: 'Administrativo/Gestão' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Recursos Humanos (RH)', label: 'Recursos Humanos (RH)' },
  { value: 'Comercial/Marketing', label: 'Comercial/Marketing' },
  { value: 'Operacional/Produção', label: 'Operacional/Produção' },
  { value: 'Tecnologia da Informação (TI)', label: 'Tecnologia da Informação (TI)' },
  { value: 'Logística/Transportes', label: 'Logística/Transportes' },
  { value: 'Outro', label: 'Outro' },
] as const;

// ============================================================================
// VALORES INICIAIS
// ============================================================================

const INITIAL_FILTERS: DashboardFilters = {
  periodPreset: '30',
  dateRange: { start: null, end: null },
  categories: [],      // Vazio = Todos
  criticalities: [],   // Vazio = Todos
  sentiments: [],      // Vazio = Todos
  themes: [],          // Vazio = Todos
  departments: [],     // Vazio = Todos
};

// ============================================================================
// CONTEXTO
// ============================================================================

const DashboardFiltersContext = createContext<DashboardFiltersContextType | undefined>(undefined);

// ============================================================================
// HELPERS
// ============================================================================

function calculateDateFromPreset(preset: PeriodPreset): DateRange {
  if (preset === 'custom') {
    return { start: null, end: null };
  }
  
  const days = parseInt(preset, 10);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

function toggleArrayItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) {
    return [...array, item];
  }
  return array.filter((_, i) => i !== index);
}

// ============================================================================
// PROVIDER
// ============================================================================

interface DashboardFiltersProviderProps {
  children: ReactNode;
}

export function DashboardFiltersProvider({ children }: DashboardFiltersProviderProps) {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);

  // Setters individuais
  const setPeriodPreset = useCallback((preset: PeriodPreset) => {
    setFilters(prev => ({
      ...prev,
      periodPreset: preset,
      dateRange: preset !== 'custom' ? { start: null, end: null } : prev.dateRange,
    }));
  }, []);

  const setDateRange = useCallback((range: DateRange) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range,
      periodPreset: 'custom',
    }));
  }, []);

  const setCategories = useCallback((categories: string[]) => {
    setFilters(prev => ({ ...prev, categories }));
  }, []);

  const setCriticalities = useCallback((criticalities: string[]) => {
    setFilters(prev => ({ ...prev, criticalities }));
  }, []);

  const setSentiments = useCallback((sentiments: string[]) => {
    setFilters(prev => ({ ...prev, sentiments }));
  }, []);

  const setThemes = useCallback((themes: string[]) => {
    setFilters(prev => ({ ...prev, themes }));
  }, []);

  const setDepartments = useCallback((departments: string[]) => {
    setFilters(prev => ({ ...prev, departments }));
  }, []);

  // Toggles
  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: toggleArrayItem(prev.categories, category),
    }));
  }, []);

  const toggleCriticality = useCallback((criticality: string) => {
    setFilters(prev => ({
      ...prev,
      criticalities: toggleArrayItem(prev.criticalities, criticality),
    }));
  }, []);

  const toggleSentiment = useCallback((sentiment: string) => {
    setFilters(prev => ({
      ...prev,
      sentiments: toggleArrayItem(prev.sentiments, sentiment),
    }));
  }, []);

  const toggleTheme = useCallback((theme: string) => {
    setFilters(prev => ({
      ...prev,
      themes: toggleArrayItem(prev.themes, theme),
    }));
  }, []);

  const toggleDepartment = useCallback((department: string) => {
    setFilters(prev => ({
      ...prev,
      departments: toggleArrayItem(prev.departments, department),
    }));
  }, []);

  // Reset
  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Computed: data range efetiva
  const computedDateRange = useMemo<DateRange>(() => {
    if (filters.periodPreset === 'custom') {
      return filters.dateRange;
    }
    return calculateDateFromPreset(filters.periodPreset);
  }, [filters.periodPreset, filters.dateRange]);

  // Computed: verifica se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.criticalities.length > 0 ||
      filters.sentiments.length > 0 ||
      filters.themes.length > 0 ||
      filters.departments.length > 0 ||
      filters.periodPreset !== '30'
    );
  }, [filters]);

  const value: DashboardFiltersContextType = {
    filters,
    setPeriodPreset,
    setDateRange,
    setCategories,
    setCriticalities,
    setSentiments,
    setThemes,
    setDepartments,
    toggleCategory,
    toggleCriticality,
    toggleSentiment,
    toggleTheme,
    toggleDepartment,
    resetFilters,
    computedDateRange,
    hasActiveFilters,
  };

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useDashboardFilters(): DashboardFiltersContextType {
  const context = useContext(DashboardFiltersContext);
  if (!context) {
    throw new Error('useDashboardFilters must be used within DashboardFiltersProvider');
  }
  return context;
}
