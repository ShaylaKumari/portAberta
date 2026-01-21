import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyContext } from "@/contexts/CompanyContext";

export function CompanyGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { company, loadCompanyFromUser, loading: companyLoading } = useCompanyContext();
  const [match, params] = useRoute("/dashboard/:companySlug");
  const [, setLocation] = useLocation();

  const companySlug = params?.companySlug;

  useEffect(() => {
    async function validateAccess() {
      if (authLoading || companyLoading) return;

      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }

      const userCompany = company || (await loadCompanyFromUser());

      if (!userCompany || userCompany.slug !== companySlug) {
        setLocation("/unauthorized");
      }
    }

    validateAccess();
  }, [
    authLoading,
    companyLoading,
    isAuthenticated,
    company,
    companySlug,
    loadCompanyFromUser,
    setLocation,
  ]);

  if (authLoading || companyLoading || !company) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return <>{children}</>;
}
