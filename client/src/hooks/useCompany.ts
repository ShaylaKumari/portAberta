import { useCompanyContext } from '@/contexts/CompanyContext';

export function useCompany() {
  return useCompanyContext();
}