import { DashboardFilters, DateRange } from '@/contexts/DashboardFiltersContext';

export interface ExportPayload {
  companySlug: string;
  companyName: string;
  filters: {
    periodPreset: string;
    dateRange: {
      start: string | null;
      end: string | null;
    };
    categories: string[];
    criticalities: string[];
    sentiments: string[];
    themes: string[];
    departments: string[];
  };
  requestedAt: string;
}

export interface ExportResult {
  success: boolean;
  error?: string;
}

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export async function exportDashboardReport(
  companySlug: string,
  companyName: string,
  filters: DashboardFilters,
  computedDateRange: DateRange
): Promise<ExportResult> {
  // Se não houver URL do webhook configurada, usa exportação local
  if (!N8N_WEBHOOK_URL) {
    console.warn('VITE_N8N_WEBHOOK_URL não configurada. Usando exportação local.');
    return exportLocalReport(companySlug, companyName, filters, computedDateRange);
  }

  try {
    // Monta o payload com os filtros selecionados
    const payload: ExportPayload = {
      companySlug,
      companyName,
      filters: {
        periodPreset: filters.periodPreset,
        dateRange: {
          start: computedDateRange.start?.toISOString() ?? null,
          end: computedDateRange.end?.toISOString() ?? null,
        },
        categories: filters.categories,
        criticalities: filters.criticalities,
        sentiments: filters.sentiments,
        themes: filters.themes,
        departments: filters.departments,
      },
      requestedAt: new Date().toISOString(),
    };

    // Envia a requisição POST para o webhook do n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
    }

    // Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/pdf')) {
      // Resposta é um PDF - faz o download
      const blob = await response.blob();
      downloadBlob(blob, 'relatorio-portaberta.pdf');
      return { success: true };
    } else if (contentType?.includes('application/json')) {
      // Resposta é JSON - pode conter URL do PDF ou erro
      const jsonResponse = await response.json();
      
      if (jsonResponse.pdfUrl) {
        // Se o n8n retornar uma URL do PDF, faz o download
        await downloadPdfFromUrl(jsonResponse.pdfUrl, 'relatorio-portaberta.pdf');
        return { success: true };
      } else if (jsonResponse.pdfBase64) {
        // Se o n8n retornar o PDF em base64
        const blob = base64ToBlob(jsonResponse.pdfBase64, 'application/pdf');
        downloadBlob(blob, 'relatorio-portaberta.pdf');
        return { success: true };
      } else if (jsonResponse.error) {
        throw new Error(jsonResponse.error);
      } else {
        // Resposta JSON sem PDF - pode ser confirmação de processamento assíncrono
        return { success: true };
      }
    } else {
      // Tenta tratar como arraybuffer/blob de qualquer forma
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, 'relatorio-portaberta.pdf');
      return { success: true };
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao exportar relatório',
    };
  }
}

async function exportLocalReport(
  companySlug: string,
  companyName: string,
  filters: DashboardFilters,
  computedDateRange: DateRange
): Promise<ExportResult> {
  try {
    // Gera um HTML simples com os filtros aplicados
    const html = generateLocalReportHtml(companyName, filters, computedDateRange);
    
    // Cria um blob do HTML
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    downloadBlob(blob, 'relatorio-portaberta.html');
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao gerar relatório local',
    };
  }
}

function generateLocalReportHtml(
  companyName: string,
  filters: DashboardFilters,
  computedDateRange: DateRange
): string {
  const formatDate = (date: Date | null) => 
    date ? date.toLocaleDateString('pt-BR') : 'N/A';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório - ${companyName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1E5FA8; }
    .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
    .label { font-weight: bold; color: #333; }
    .value { color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #1E5FA8; color: white; }
  </style>
</head>
<body>
  <h1>📊 Relatório de Feedbacks</h1>
  <p><strong>Empresa:</strong> ${companyName}</p>
  <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
  
  <div class="section">
    <h2>Filtros Aplicados</h2>
    <table>
      <tr>
        <th>Filtro</th>
        <th>Valor</th>
      </tr>
      <tr>
        <td>Período</td>
        <td>${formatDate(computedDateRange.start)} até ${formatDate(computedDateRange.end)}</td>
      </tr>
      <tr>
        <td>Categorias</td>
        <td>${filters.categories.length > 0 ? filters.categories.join(', ') : 'Todas'}</td>
      </tr>
      <tr>
        <td>Criticidades</td>
        <td>${filters.criticalities.length > 0 ? filters.criticalities.join(', ') : 'Todas'}</td>
      </tr>
      <tr>
        <td>Sentimentos</td>
        <td>${filters.sentiments.length > 0 ? filters.sentiments.join(', ') : 'Todos'}</td>
      </tr>
      <tr>
        <td>Setores</td>
        <td>${filters.departments.length > 0 ? filters.departments.join(', ') : 'Todos'}</td>
      </tr>
      <tr>
        <td>Temas</td>
        <td>${filters.themes.length > 0 ? filters.themes.join(', ') : 'Todos'}</td>
      </tr>
    </table>
  </div>
  
  <div class="section">
    <p><em>Para obter o relatório completo com análises detalhadas, configure a integração com o n8n.</em></p>
  </div>
  
  <footer style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
    <p>Relatório gerado pelo sistema PortAberta</p>
  </footer>
</body>
</html>
  `.trim();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function downloadPdfFromUrl(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao baixar PDF: ${response.status}`);
  }
  const blob = await response.blob();
  downloadBlob(blob, filename);
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export interface FeedbackForExport {
  id: string;
  department: string;
  main_theme: string;
  classified_type: string;
  sentiment: string;
  criticality: string;
  executive_summary: string | null;
  feedback: string;
  created_at: string;
}

export function exportFeedbacksAsCsv(feedbacks: FeedbackForExport[], filename = 'feedbacks-portaberta.csv'): void {
  if (feedbacks.length === 0) {
    console.warn('Nenhum feedback para exportar');
    return;
  }

  const headers = [
    'Data',
    'Setor',
    'Tema',
    'Categoria',
    'Sentimento',
    'Criticidade',
    'Resumo',
    'Feedback Original',
  ];

  const rows = feedbacks.map(f => [
    formatDateForCsv(f.created_at),
    escapeCsvField(f.department),
    escapeCsvField(f.main_theme),
    escapeCsvField(f.classified_type),
    escapeCsvField(f.sentiment),
    escapeCsvField(f.criticality),
    escapeCsvField(f.executive_summary ?? ''),
    escapeCsvField(f.feedback),
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';')),
  ].join('\n');

  // Adiciona BOM para suporte a caracteres especiais no Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, filename);
}

function formatDateForCsv(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function escapeCsvField(field: string): string {
  if (!field) return '';
  // Escapa aspas duplas e envolve em aspas se necessário
  const escaped = field.replace(/"/g, '""');
  if (escaped.includes(';') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  return escaped;
}
