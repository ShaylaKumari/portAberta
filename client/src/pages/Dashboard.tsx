import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useFeedbacksOverTime } from '@/hooks/useFeedbacksOverTime';
import { useFeedbackByType } from '@/hooks/useFeedbackByType';
import { useRecentFeedbacks } from '@/hooks/useRecentFeedbacks';
import { useCompany } from '@/hooks/useCompany';
import { CompanyGate } from '@/components/CompanyGate';
import { useFeedbackAnalysis } from '@/hooks/useFeedbackAnalysis';
import { 
  MessageSquare, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Copy,
  Download,
  Filter,
  ArrowLeft,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const INITIAL_FEEDBACKS_LIMIT = 5;
const FEEDBACKS_INCREMENT = 3;

const TIME_FILTER_OPTIONS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'Todas categorias' },
  { value: 'elogio', label: 'Elogio' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'problema', label: 'Problema' },
  { value: 'reclamacao', label: 'Reclamação' },
];

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

export default function Dashboard() {
  return (
    <CompanyGate>
      <DashboardContent />
    </CompanyGate>
  );
}

function DashboardContent() {
  const [, setLocation] = useLocation();
  const { company } = useCompany();
  const [feedbacksLimit, setFeedbacksLimit] = useState(INITIAL_FEEDBACKS_LIMIT);

  const {
    timeFilter,
    setTimeFilter,
    categoryFilter,
    setCategoryFilter
  } = useFeedbackAnalysis(company?.slug ?? '');

  const { data: metrics } = useDashboardMetrics();
  const { data: chartData } = useFeedbacksOverTime();
  const { feedbacks, hasMore } = useRecentFeedbacks(feedbacksLimit);
  const { data: pieData } = useFeedbackByType();

  if (!company) {
    return null;
  }

  const feedbackLink = `${window.location.origin}/feedback/${company.slug}`;

  const handleExportCSV = () => {
    toast.success('Exportação iniciada! O arquivo será baixado em breve.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackLink);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleLoadMore = () => {
    setFeedbacksLimit(prev => prev + FEEDBACKS_INCREMENT);
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
            onExport={handleExportCSV}
          />

          <PublicLinkCard 
            link={feedbackLink}
            onCopy={handleCopyLink}
          />

          <FiltersSection
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
          />

          <MetricsGrid metrics={metrics} />

          <ChartsSection 
            chartData={chartData}
            pieData={pieData}
          />

          <RecentFeedbacksSection
            feedbacks={feedbacks}
            hasMore={hasMore}
            showLessButton={feedbacksLimit > INITIAL_FEEDBACKS_LIMIT}
            onLoadMore={handleLoadMore}
            onShowLess={handleShowLess}
          />
        </div>
      </main>
    </div>
  );
}

interface DashboardHeaderProps {
  companyName: string;
  onBack: () => void;
  onExport: () => void;
}

function DashboardHeader({ companyName, onBack, onExport }: DashboardHeaderProps) {
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

        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
}

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
            <p className="text-blue-100/80">
              Compartilhe com seus colaboradores
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 pl-5 rounded-xl">
            <span className="text-[13px] text-white truncate max-w-xs">
              {link}
            </span>
            <Button onClick={onCopy} variant="ghost" size="icon" className="text-white">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FiltersSectionProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

function FiltersSection({ 
  timeFilter, 
  onTimeFilterChange, 
  categoryFilter, 
  onCategoryFilterChange 
}: FiltersSectionProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filtros:</span>
      </div>

      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_FILTER_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_FILTER_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface DashboardMetrics {
  totalFeedbacks: number;
  positiveRate: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
}

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricCards = [
    { label: 'Total de feedbacks', value: metrics.totalFeedbacks, icon: MessageSquare },
    { label: 'Taxa positiva', value: `${metrics.positiveRate}%`, icon: TrendingUp },
    { label: 'Feedbacks positivos', value: metrics.positiveFeedbacks, icon: ThumbsUp },
    { label: 'Feedbacks negativos', value: metrics.negativeFeedbacks, icon: ThumbsDown },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {metricCards.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface ChartsSectionProps {
  chartData: ChartDataPoint[];
  pieData: PieDataItem[];
}

function ChartsSection({ chartData, pieData }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <TimelineChart data={chartData} />
      <CategoryPieChart data={pieData} />
    </div>
  );
}

function formatDateForChart(dateString: string): string {
  const [, month, day] = dateString.split('-');
  return `${day}/${month}`;
}

interface TimelineChartProps {
  data: ChartDataPoint[];
}

function TimelineChart({ data }: TimelineChartProps) {
  return (
    <Card className="border-0 shadow-sm md:col-span-2">
      <CardHeader className="px-5 pt-5 pb-5">
        <CardTitle>Feedbacks ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            Nenhum feedback registrado para o filtro atual
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
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
                dataKey="date" 
                tickFormatter={formatDateForChart}
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                stroke={CHART_COLORS.axis}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false} 
                tickLine={false}
                stroke={CHART_COLORS.axis}
              />
              <Tooltip
                labelFormatter={formatDateForChart}
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

interface CategoryPieChartProps {
  data: PieDataItem[];
}

function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-5">
        <CardTitle>Por categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentFeedback {
  sentiment: 'positivo' | 'neutro' | 'negativo';
  criticality: 'alta' | 'media' | 'baixa';
  department: string;
  main_theme?: string;
  classified_type: string;
  executive_summary?: string;
  feedback: string;
  date: string;
}

interface RecentFeedbacksSectionProps {
  feedbacks: RecentFeedback[];
  hasMore: boolean;
  showLessButton: boolean;
  onLoadMore: () => void;
  onShowLess: () => void;
}

function RecentFeedbacksSection({ 
  feedbacks, 
  hasMore, 
  showLessButton,
  onLoadMore, 
  onShowLess 
}: RecentFeedbacksSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold text-foreground mt-5 mb-0">
        Feedbacks recentes
      </h3>

      {feedbacks.map((feedback, index) => (
        <FeedbackCard key={index} feedback={feedback} />
      ))}

      <div className="flex justify-center gap-3 mt-4">
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="px-4 py-2 rounded-md text-sm font-semibold bg-[#1E5FA8]/10 text-[#1E5FA8] hover:bg-[#1E5FA8]/20 transition"
          >
            Ver mais
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

interface FeedbackCardProps {
  feedback: RecentFeedback;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  const sentimentIcon = getSentimentIcon(feedback.sentiment);
  const borderColor = CRITICALITY_COLORS[feedback.criticality] ?? CRITICALITY_COLORS.baixa;

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

          <div className="flex-shrink-0 pt-0.5">
            {sentimentIcon}
          </div>
        </div>

        <FeedbackMetaTags feedback={feedback} />

        <div
          className="px-3 py-2 rounded-sm text-[13px] text-slate-700 bg-gray-100"
          style={{ borderLeft: `4px solid ${borderColor}` }}
        >
          "{feedback.feedback}"
        </div>

        <p className="text-[11px] text-slate-400">
          {formatFeedbackDate(feedback.date)}
        </p>
      </CardContent>
    </Card>
  );
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment) {
    case 'positivo':
      return <ThumbsUp className="w-5 h-5 text-green-500" />;
    case 'negativo':
      return <ThumbsDown className="w-5 h-5 text-red-500" />;
    default:
      return <Minus className="w-5 h-5 text-slate-300" />;
  }
}

function FeedbackMetaTags({ feedback }: { feedback: RecentFeedback }) {
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
