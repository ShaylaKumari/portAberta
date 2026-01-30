import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManageAccessModal } from "@/components/ManageAccessModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';
import {
  useDashboardMetrics,
  useFeedbacksOverTimeFiltered,
  useCriticalityByWeek,
  useSentimentDistribution,
  useCategoryDistribution,
  useRecentFeedbacksFiltered,
  useAvailableThemes,
  DashboardMetrics,
  TimeSeriesDataPoint,
  CriticalityWeekData,
  PieChartData,
  FilteredFeedback,
} from '@/hooks/useDashboardMetrics';
import { useCompany } from '@/hooks/useCompany';
import { CompanyGate } from '@/components/CompanyGate';
import {
  DashboardFiltersProvider,
  useDashboardFilters,
  PERIOD_OPTIONS,
  CATEGORY_OPTIONS,
  CRITICALITY_OPTIONS,
  SENTIMENT_OPTIONS,
  DEPARTMENT_OPTIONS,
  PeriodPreset,
} from '@/contexts/DashboardFiltersContext';
import { exportDashboardReport } from '@/services/reportExport.service';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Filter,
  ArrowLeft,
  Minus,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

// ============================================================================
// CONSTANTES
// ============================================================================

const INITIAL_FEEDBACKS_LIMIT = 5;
const FEEDBACKS_INCREMENT = 3;

const CHART_COLORS = {
  gradient: {
    start: '#1E5FA8',
    startOpacity: 0.3,
    endOpacity: 0,
  },
  stroke: 'oklch(0.55 0.19 254)',
  axis: 'oklch(0.50 0.01 254)',
  border: 'oklch(0.90 0.005 254)',
};

const CRITICALITY_COLORS = {
  alta: '#EF4444',
  media: '#FACC15',
  baixa: '#22C55E',
} as const;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Dashboard() {
  return (
    <CompanyGate>
      <DashboardFiltersProvider>
        <DashboardContent />
      </DashboardFiltersProvider>
    </CompanyGate>
  );
}

function DashboardContent() {
  const [, setLocation] = useLocation();
  const { company } = useCompany();
  const [feedbacksLimit, setFeedbacksLimit] = useState(INITIAL_FEEDBACKS_LIMIT);
  const [isExporting, setIsExporting] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const { filters, computedDateRange, hasActiveFilters, resetFilters } = useDashboardFilters();

  // Hooks de dados com filtros dinâmicos
  const { data: metrics, loading: metricsLoading } = useDashboardMetrics();
  const { data: timelineData, loading: timelineLoading, shouldGroupByWeek } = useFeedbacksOverTimeFiltered();
  const { data: criticalityData, loading: criticalityLoading } = useCriticalityByWeek();
  const { data: sentimentPieData, loading: sentimentPieLoading } = useSentimentDistribution();
  const { data: categoryPieData, loading: categoryPieLoading } = useCategoryDistribution();
  const { feedbacks, hasMore, loading: feedbacksLoading } = useRecentFeedbacksFiltered(feedbacksLimit);

  if (!company) {
    return null;
  }

  const feedbackLink = `${window.location.origin}/feedback/${company.slug}`;

  const handleExportReport = async () => {
    setIsExporting(true);
    toast.info('Gerando relatório...');

    const result = await exportDashboardReport(
      company.slug,
      company.name,
      filters,
      computedDateRange
    );

    setIsExporting(false);

    if (result.success) {
      toast.success('Relatório exportado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao exportar relatório');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackLink);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleLoadMore = () => {
    setFeedbacksLimit((prev) => prev + FEEDBACKS_INCREMENT);
  };

  const handleShowLess = () => {
    setFeedbacksLimit(INITIAL_FEEDBACKS_LIMIT);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <DashboardHeader
            companyName={company.name}
            onBack={() => setLocation('/')}
            onExport={handleExportReport}
            isExporting={isExporting}
            onManageAccess={() => setIsAccessModalOpen(true)}
          />

        <ManageAccessModal 
          open={isAccessModalOpen} 
          onOpenChange={setIsAccessModalOpen} 
          company_id={company.id}
        />

          <PublicLinkCard link={feedbackLink} onCopy={handleCopyLink} />

          <FiltersSection
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />

          <MetricsGrid metrics={metrics} loading={metricsLoading} />

          <ChartsSection
            timelineData={timelineData}
            timelineLoading={timelineLoading}
            shouldGroupByWeek={shouldGroupByWeek}
            criticalityData={criticalityData}
            criticalityLoading={criticalityLoading}
            sentimentPieData={sentimentPieData}
            sentimentPieLoading={sentimentPieLoading}
            categoryPieData={categoryPieData}
            categoryPieLoading={categoryPieLoading}
          />

          <RecentFeedbacksSection
            feedbacks={feedbacks}
            hasMore={hasMore}
            loading={feedbacksLoading}
            showLessButton={feedbacksLimit > INITIAL_FEEDBACKS_LIMIT}
            onLoadMore={handleLoadMore}
            onShowLess={handleShowLess}
          />
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// HEADER
// ============================================================================

interface DashboardHeaderProps {
  companyName: string;
  onBack: () => void;
  onExport: () => void;
  isExporting: boolean;
  onManageAccess: () => void;
}

function DashboardHeader({ companyName, onBack, onExport, isExporting, onManageAccess }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{companyName}</p>
        </div>

        <div className='flex gap-5'>
          <Button variant="outline" className="gap-3" size="sm" onClick={onManageAccess}>
              <Users className="w-4 h-4" />
              Gerenciar acessos
          </Button>
          <Button onClick={onExport} variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LINK PÚBLICO
// ============================================================================

interface PublicLinkCardProps {
  link: string;
  onCopy: () => void;
}

function PublicLinkCard({ link, onCopy }: PublicLinkCardProps) {
  return (
    <Card className="mb-8 bg-gradient-to-r from-primary to-secondary-btn rounded-[20px] p-1 border-none">
      <CardContent className="py-5 px-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-1">
              Link de feedback público
            </h3>
            <p className="text-blue-100/80">Compartilhe com seus colaboradores</p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 pl-5 rounded-xl">
            <span className="text-[13px] text-white truncate max-w-xs">{link}</span>
            <Button onClick={onCopy} variant="ghost" size="icon" className="text-white">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SEÇÃO DE FILTROS
// ============================================================================

interface FiltersSectionProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

function FiltersSection({ hasActiveFilters, onResetFilters }: FiltersSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    filters,
    setPeriodPreset,
    setDateRange,
    toggleCategory,
    toggleCriticality,
    toggleSentiment,
    toggleDepartment,
    toggleTheme,
    computedDateRange,
  } = useDashboardFilters();

  const { themes: availableThemes } = useAvailableThemes();

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 pb-4">
        {/* Header dos filtros */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                Ativos
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filtro de período (sempre visível) */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Período:</Label>
            <Select
              value={filters.periodPreset}
              onValueChange={(value) => setPeriodPreset(value as PeriodPreset)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filters.periodPreset === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-[150px]"
                value={filters.dateRange.start?.toISOString().split('T')[0] ?? ''}
                onChange={(e) =>
                  setDateRange({
                    ...filters.dateRange,
                    start: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                className="w-[150px]"
                value={filters.dateRange.end?.toISOString().split('T')[0] ?? ''}
                onChange={(e) =>
                  setDateRange({
                    ...filters.dateRange,
                    end: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Filtros expandidos */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
            {/* Categorias */}
            <FilterGroup
              title="Categorias"
              options={CATEGORY_OPTIONS}
              selected={filters.categories}
              onToggle={toggleCategory}
            />

            {/* Criticidade */}
            <FilterGroup
              title="Criticidade"
              options={CRITICALITY_OPTIONS}
              selected={filters.criticalities}
              onToggle={toggleCriticality}
            />

            {/* Sentimento */}
            <FilterGroup
              title="Sentimento"
              options={SENTIMENT_OPTIONS}
              selected={filters.sentiments}
              onToggle={toggleSentiment}
            />

            {/* Setores */}
            <FilterGroup
              title="Setores"
              options={DEPARTMENT_OPTIONS}
              selected={filters.departments}
              onToggle={toggleDepartment}
            />

            {/* Temas */}
            {availableThemes.length > 0 && (
              <FilterGroup
                title="Temas"
                options={availableThemes.map((t) => ({ value: t, label: t }))}
                selected={filters.themes}
                onToggle={toggleTheme}
              />
            )}
          </div>
        )}

        {/* Tags de filtros ativos */}
        {hasActiveFilters && (
          <ActiveFilterTags />
        )}
      </CardContent>
    </Card>
  );
}

interface FilterGroupProps {
  title: string;
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{title}</Label>
      <div className="space-y-2 max-h-[150px] overflow-y-auto">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`${title}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={`${title}-${option.value}`}
              className="text-sm cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveFilterTags() {
  const { filters, toggleCategory, toggleCriticality, toggleSentiment, toggleDepartment, toggleTheme } = useDashboardFilters();

  const tags = useMemo(() => {
    const result: { label: string; onRemove: () => void }[] = [];

    filters.categories.forEach((c) => {
      const option = CATEGORY_OPTIONS.find((o) => o.value === c);
      result.push({ label: option?.label ?? c, onRemove: () => toggleCategory(c) });
    });

    filters.criticalities.forEach((c) => {
      const option = CRITICALITY_OPTIONS.find((o) => o.value === c);
      result.push({ label: option?.label ?? c, onRemove: () => toggleCriticality(c) });
    });

    filters.sentiments.forEach((s) => {
      const option = SENTIMENT_OPTIONS.find((o) => o.value === s);
      result.push({ label: option?.label ?? s, onRemove: () => toggleSentiment(s) });
    });

    filters.departments.forEach((d) => {
      const option = DEPARTMENT_OPTIONS.find((o) => o.value === d);
      result.push({ label: option?.label ?? d, onRemove: () => toggleDepartment(d) });
    });

    filters.themes.forEach((t) => {
      result.push({ label: t, onRemove: () => toggleTheme(t) });
    });

    return result;
  }, [filters, toggleCategory, toggleCriticality, toggleSentiment, toggleDepartment, toggleTheme]);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
        >
          {tag.label}
          <button onClick={tag.onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// GRID DE MÉTRICAS
// ============================================================================

interface MetricsGridProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  const metricCards = [
    {
      label: 'Total de feedbacks',
      value: metrics.totalFeedbacks,
      icon: MessageSquare,
    },
    {
      label: 'Taxa positiva',
      value: `${metrics.positiveRate}%`,
      icon: metrics.trend === 'up' ? TrendingUp : metrics.trend === 'down' ? TrendingDown : TrendingUp,
      trend: metrics.trend,
    },
    {
      label: 'Feedbacks positivos',
      value: metrics.positiveFeedbacks,
      icon: ThumbsUp,
    },
    {
      label: 'Feedbacks negativos',
      value: metrics.negativeFeedbacks,
      icon: ThumbsDown,
    },
    {
      label: 'Feedbacks críticos',
      value: metrics.criticalFeedbacks,
      icon: AlertTriangle,
      critical: metrics.criticalFeedbacks > 0, 
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {metricCards.map(({ label, value, icon: Icon, trend, highlight, critical }) => (
        <Card
          key={label}
          className={"border-0 shadow-sm"}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  critical
                    ? 'bg-red-200'
                    : highlight
                    ? 'bg-accent'
                    : 'bg-accent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    critical
                      ? 'text-red-600'
                      : trend === 'up'
                      ? 'text-green-500'
                      : trend === 'down'
                      ? 'text-red-500'
                      : 'text-primary'
                  }`}
                />
              </div>
            </div>
            {loading ? (
              <div className="h-9 flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <p className={`text-2xl md:text-3xl font-bold ${critical ? 'text-red-600' : 'text-foreground'}`}>
                {value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// SEÇÃO DE GRÁFICOS
// ============================================================================

interface ChartsSectionProps {
  timelineData: TimeSeriesDataPoint[];
  timelineLoading: boolean;
  shouldGroupByWeek: boolean;
  criticalityData: CriticalityWeekData[];
  criticalityLoading: boolean;
  sentimentPieData: PieChartData[];
  sentimentPieLoading: boolean;
  categoryPieData: PieChartData[];
  categoryPieLoading: boolean;
}

function ChartsSection({
  timelineData,
  timelineLoading,
  shouldGroupByWeek,
  criticalityData,
  criticalityLoading,
  sentimentPieData,
  sentimentPieLoading,
  categoryPieData,
  categoryPieLoading,
}: ChartsSectionProps) {
  return (
    <div className="space-y-6 mb-8">
      {/* Linha 1: Evolução temporal + Criticidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelineChart
          data={timelineData}
          loading={timelineLoading}
          groupedByWeek={shouldGroupByWeek}
        />
        <CriticalityBarChart data={criticalityData} loading={criticalityLoading} />
      </div>

      {/* Linha 2: Gráficos de rosca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SentimentPieChart data={sentimentPieData} loading={sentimentPieLoading} />
        <CategoryPieChart data={categoryPieData} loading={categoryPieLoading} />
      </div>
    </div>
  );
}

// ============================================================================
// GRÁFICO DE EVOLUÇÃO TEMPORAL
// ============================================================================

interface TimelineChartProps {
  data: TimeSeriesDataPoint[];
  loading: boolean;
  groupedByWeek: boolean;
}

function TimelineChart({ data, loading, groupedByWeek }: TimelineChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-lg">
          Evolução {groupedByWeek ? 'Semanal' : 'Diária'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            Nenhum feedback registrado para o filtro atual
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.gradient.start}
                    stopOpacity={CHART_COLORS.gradient.startOpacity}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.gradient.start}
                    stopOpacity={CHART_COLORS.gradient.endOpacity}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                stroke={CHART_COLORS.axis}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                stroke={CHART_COLORS.axis}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, 'Feedbacks']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid ${CHART_COLORS.border}`,
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRÁFICO DE BARRAS - CRITICIDADE
// ============================================================================

interface CriticalityBarChartProps {
  data: CriticalityWeekData[];
  loading: boolean;
}

function CriticalityBarChart({ data, loading }: CriticalityBarChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-lg">Feedbacks Críticos por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            Nenhum feedback crítico no período
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                stroke={CHART_COLORS.axis}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                stroke={CHART_COLORS.axis}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value}`, 'Críticos']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid ${CHART_COLORS.border}`,
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="criticos" 
                name="Feedbacks Críticos" 
                fill={'#1E5FA8'} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRÁFICO DE ROSCA - SENTIMENTO
// ============================================================================

interface SentimentPieChartProps {
  data: PieChartData[];
  loading: boolean;
}

function SentimentPieChart({ data, loading }: SentimentPieChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-lg">Distribuição por Sentimento</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-gray-500">Nenhum dado disponível</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRÁFICO DE ROSCA - CATEGORIA
// ============================================================================

interface CategoryPieChartProps {
  data: PieChartData[];
  loading: boolean;
}

function CategoryPieChart({ data, loading }: CategoryPieChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-10 text-gray-500">Nenhum dado disponível</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// SEÇÃO DE FEEDBACKS RECENTES
// ============================================================================

interface RecentFeedbacksSectionProps {
  feedbacks: FilteredFeedback[];
  hasMore: boolean;
  loading: boolean;
  showLessButton: boolean;
  onLoadMore: () => void;
  onShowLess: () => void;
}

function RecentFeedbacksSection({
  feedbacks,
  hasMore,
  loading,
  showLessButton,
  onLoadMore,
  onShowLess,
}: RecentFeedbacksSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-foreground mt-5 mb-0">Feedbacks recentes</h3>

      {loading && feedbacks.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum feedback encontrado para os filtros selecionados
          </CardContent>
        </Card>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackCard key={feedback.id} feedback={feedback} />
        ))
      )}

      <div className="flex justify-center gap-3 mt-4">
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-[#1E5FA8]/10 text-[#1E5FA8] hover:bg-[#1E5FA8]/20 transition disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Ver mais'}
          </button>
        )}

        {!hasMore && showLessButton && (
          <button
            onClick={onShowLess}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            Ver menos
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CARD DE FEEDBACK
// ============================================================================

interface FeedbackCardProps {
  feedback: FilteredFeedback;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  const sentimentIcon = getSentimentIcon(feedback.sentiment);
  const borderColor =
    CRITICALITY_COLORS[feedback.criticality as keyof typeof CRITICALITY_COLORS] ??
    CRITICALITY_COLORS.baixa;

  return (
    <Card className="border border-border shadow-sm bg-white overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-md bg-[#1E5FA8]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#1E5FA8]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] text-slate-700 leading-normal">
              {feedback.executive_summary || feedback.feedback}
            </p>
          </div>

          <div className="flex-shrink-0 pt-0.5">{sentimentIcon}</div>
        </div>

        <FeedbackMetaTags feedback={feedback} />

        <div
          className="px-3 py-2 rounded-sm text-[13px] text-slate-700 bg-gray-100"
          style={{ borderLeft: `4px solid ${borderColor}` }}
        >
          "{feedback.feedback}"
        </div>

        <p className="text-[11px] text-slate-400">{formatFeedbackDate(feedback.created_at)}</p>
      </CardContent>
    </Card>
  );
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment?.toLowerCase()) {
    case 'positivo':
      return <ThumbsUp className="w-5 h-5 text-green-500" />;
    case 'negativo':
      return <ThumbsDown className="w-5 h-5 text-red-500" />;
    default:
      return <Minus className="w-5 h-5 text-slate-300" />;
  }
}

function FeedbackMetaTags({ feedback }: { feedback: FilteredFeedback }) {
  const tags = [
    { label: 'Setor', value: feedback.department },
    feedback.main_theme ? { label: 'Tema', value: feedback.main_theme } : null,
    { label: 'Tipo', value: feedback.classified_type },
    { label: 'Criticidade', value: feedback.criticality },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-2 py-0.5 rounded-sm font-semibold bg-white border border-slate-200"
        >
          {tag.label}: {tag.value}
        </span>
      ))}
    </div>
  );
}

function formatFeedbackDate(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}