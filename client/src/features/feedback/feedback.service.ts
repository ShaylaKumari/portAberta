import { supabase } from '@/lib/supabase';
import type { Department, FeedbackType } from './feedback.constants';

interface SubmitFeedbackParams {
  companySlug: string;
  department: Department;
  feedbackType?: FeedbackType;
  feedback: string;
}

interface SubmitFeedbackResult {
  success: boolean;
}

export async function submitFeedback(params: SubmitFeedbackParams): Promise<SubmitFeedbackResult> {
  const { error } = await supabase
    .from('feedback_raw')
    .insert({
      company_slug: params.companySlug,
      department: params.department,
      feedback_type: params.feedbackType ?? null,
      feedback: params.feedback,
      processed: false,
    });

  if (error) {
    console.error('Error submitting feedback:', error);
    throw new Error('Erro ao enviar feedback');
  }

  return { success: true };
}
