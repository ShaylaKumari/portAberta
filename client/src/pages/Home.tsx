import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Shield, BarChart3, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

const features = [
  {
    title: 'Feedback Contínuo',
    description: 'Colaboradores expressam opiniões de forma livre e segura.',
    icon: MessageSquare,
  },
  {
    title: 'Dados Protegidos',
    description: 'Nenhum dado pessoal é coletado. Sem IP, sem login, sem rastreamento.',
    icon: Shield,
  },
  {
    title: 'Insights Valiosos',
    description:
      'Dashboard completo com análise de sentimento, tendências e categorização de tópicos.',
    icon: BarChart3,
  },
];


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Feedback anônimo para{' '}
              <span className="text-primary">empresas que evoluem</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Crie um canal seguro e anônimo para seus colaboradores compartilharem 
              sugestões, elogios e críticas. Tome decisões baseadas em dados reais.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quem-somos">
                <Button variant="muted">
                  Quem somos
                </Button>
              </Link>

              <Link href="/login">
                <Button>
                  Acessar Dashboard
                  <ArrowRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map(({ title, description, icon: Icon }) => (
              <Card key={title} className="card-hover border-0 shadow-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-13 h-13 rounded-md bg-accent flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {title}
                  </h3>
                  <p className="text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 mt-auto border-t border-border">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 portAberta. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
