import { useEffect, useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { Info, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FeedbackForm } from '@/features/feedback/FeedbackForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Feedback() {
  const [, params] = useRoute('/feedback/:companySlug');
  const [, setLocation] = useLocation();

  const rawSlug = params?.companySlug;
  const companySlug = rawSlug ?? '';

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidSlug, setIsValidSlug] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    if (!companySlug) {
      setIsValidSlug(false);
      return;
    }

    const validateSlug = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('slug', companySlug)
        .maybeSingle();

      if (error || !data) {
        setIsValidSlug(false);
      } else {
        setCompanyName(data.name);
        setIsValidSlug(true);
      }
    };

    validateSlug();
  }, [companySlug]);

  useEffect(() => {
    if (isValidSlug === false) {
      setLocation('/empresa-invalida');
    }
  }, [isValidSlug, setLocation]);

  if (isValidSlug === null) {
    return null; // loader opcional
  }

  if (isValidSlug === false) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-12">
            <Check className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold">Obrigado!</h2>
            <p className="text-muted-foreground mt-2">
              Seu feedback foi enviado de forma anônima.
            </p>
            <Link href="/">
              <Button className="mt-6">Conhecer o portAberta</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <div className="flex justify-center mb-4 gap-2">
          <img src="/images/logo-porta.png" alt="portAberta" className="h-8 w-auto" />
          <img src="/images/logo-nome.png" alt="portAberta" className="h-8 w-auto" />
        </div>

        <h1 className="text-3xl font-bold">
          Feedback para {companyName}
        </h1>
        <p className="text-muted-foreground">
          Compartilhe sua opinião de forma segura
        </p>
      </header>

      <div className="mb-6 p-4 bg-accent rounded-lg flex gap-3 items-center">
        <Info className="text-primary" />
        <p className="text-sm">
          Não solicitamos login, não rastreamos IP, não coletamos cookies.
          Sua mensagem é 100% anônima.
        </p>
      </div>

      <FeedbackForm
        companySlug={companySlug}
        onSuccess={() => setIsSubmitted(true)}
      />

      <p className="text-center text-xs text-muted-foreground mt-10">
        Powered by{' '}
        <Link
          href="/"
          className="font-semibold text-[#1E5FA8] hover:underline transition-all"
        >
          portAberta
        </Link>
      </p>
    </div>
  );
}
