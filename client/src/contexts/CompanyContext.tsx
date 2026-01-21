import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Company {
  id: string;
  name: string;
  slug: string;
}

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  loadCompanyFromUser: () => Promise<Company | null>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCompanyFromUser = useCallback(async (): Promise<Company | null> => {
    if (!user?.email) {
      return null;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('user_companies')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (error) {
      console.error('Error loading company:', error);
      setCompany(null);
      setLoading(false);
      return null;
    }

    if (!data) {
      setCompany(null);
      setLoading(false);
      return null;
    }

    const companyData: Company = {
      id: data.company_id,
      name: data.name,
      slug: data.slug,
    };

    setCompany(companyData);
    setLoading(false);
    return companyData;
  }, [user?.email]);

  return (
    <CompanyContext.Provider value={{ company, loading, loadCompanyFromUser }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyContext must be used within CompanyProvider');
  }
  return context;
}
