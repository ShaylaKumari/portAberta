import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { DEPARTMENTS, FEEDBACK_TYPES, type Department, type FeedbackType } from './feedback.constants';
import { submitFeedback } from './feedback.service';

const MIN_FEEDBACK_LENGTH = 10;
const MAX_FEEDBACK_LENGTH = 2000;

interface FeedbackFormProps {
  companySlug: string;
  onSuccess: () => void;
}

export function FeedbackForm({ companySlug, onSuccess }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | undefined>();
  const [feedback, setFeedback] = useState('');
  const [department, setDepartment] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useCallback(() => {
    const hasDepartment = department.length > 0;
    const hasFeedback = feedback.trim().length >= MIN_FEEDBACK_LENGTH;
    const hasConsent = consentGiven;
    
    return hasDepartment && hasFeedback && hasConsent;
  }, [department, feedback, consentGiven]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!isFormValid()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      await submitFeedback({
        companySlug,
        department: department as Department,
        feedback,
        feedbackType,
      });

      onSuccess();
    } catch {
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Enviar Feedback</CardTitle>
        <CardDescription>
          Sua opinião é importante para melhorar o ambiente de trabalho.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <DepartmentSelect 
            value={department} 
            onChange={setDepartment} 
          />

          <FeedbackTypeSelect 
            value={feedbackType} 
            onChange={setFeedbackType} 
          />

          <FeedbackTextarea 
            value={feedback} 
            onChange={setFeedback} 
          />

          <ConsentCheckbox 
            checked={consentGiven} 
            onChange={setConsentGiven} 
          />

          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
}

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function DepartmentSelect({ value, onChange }: DepartmentSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Setor *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um setor" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.value} value={dept.value}>
              {dept.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FeedbackTypeSelectProps {
  value: FeedbackType | undefined;
  onChange: (value: FeedbackType) => void;
}

function FeedbackTypeSelect({ value, onChange }: FeedbackTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Tipo de Feedback</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {FEEDBACK_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FeedbackTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

function FeedbackTextarea({ value, onChange }: FeedbackTextareaProps) {
  return (
    <div className="space-y-2">
      <Label>Seu feedback *</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px]"
        maxLength={MAX_FEEDBACK_LENGTH}
      />
      <p className="text-xs text-muted-foreground text-right">
        {value.length}/{MAX_FEEDBACK_LENGTH} caracteres
      </p>
    </div>
  );
}

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ConsentCheckbox({ checked, onChange }: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-accent rounded-lg">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(Boolean(value))}
      />
      <div className="flex-1">
        <Label className="text-sm">Este feedback é anônimo *</Label>
        <p className="text-xs mt-1">
          Confirmo que entendo que nenhum dado pessoal será coletado.
        </p>
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  isSubmitting: boolean;
}

function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        'Enviando...'
      ) : (
        <>
          <Send className="w-4 h-4 mr-2" />
          Enviar Feedback
        </>
      )}
    </Button>
  );
}
