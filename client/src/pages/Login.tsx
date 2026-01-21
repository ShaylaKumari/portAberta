import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Login() {
  const { isAuthenticated, loginWithGoogle, loading } = useAuth();
  const { loadCompanyFromUser } = useCompanyContext();
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function handleRedirect() {
      if (loading || !isAuthenticated) return;

      const company = await loadCompanyFromUser();

      if (company) {
        setLocation(`/dashboard/${company.slug}`);
      } else {
        // usuário logou mas não pertence a nenhuma empresa
        setLocation('/unauthorized');
      }
    }

    handleRedirect();
  }, [isAuthenticated, loading, loadCompanyFromUser, setLocation]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Back button */}
      <div className="container pt-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o início
          </Button>
        </Link>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center gap-2">
              <img src="/images/logo-porta.png" className="h-7" />
              <img src="/images/logo-nome.png" className="h-7" />
            </div>

            <div>
              <CardTitle className="text-2xl font-bold">
                Painel da Empresa
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Faça login com sua conta Google autorizada
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={loginWithGoogle}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Entrar com Google
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Apenas e-mails previamente autorizados podem acessar o painel.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
