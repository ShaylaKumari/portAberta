export const DEPARTMENTS = [
  { value: 'Administrativo/Gestão', label: 'Administrativo/Gestão' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Recursos Humanos (RH)', label: 'Recursos Humanos (RH)' },
  { value: 'Comercial/Marketing', label: 'Comercial/Marketing' },
  { value: 'Operacional/Produção', label: 'Operacional/Produção' },
  { value: 'Tecnologia da Informação (TI)', label: 'Tecnologia da Informação (TI)' },
  { value: 'Logística/Transportes', label: 'Logística/Transportes' },
  { value: 'Outro', label: 'Outro' },
] as const;

export type Department =
  typeof DEPARTMENTS[number]['value'];

export const FEEDBACK_TYPES = [
  { value: 'Elogio', label: 'Elogio' },
  { value: 'Sugestão', label: 'Sugestão' },
  { value: 'Problema', label: 'Problema' },
  { value: 'Reclamação', label: 'Reclamação' },
] as const;

export type FeedbackType =
  typeof FEEDBACK_TYPES[number]['value'];
