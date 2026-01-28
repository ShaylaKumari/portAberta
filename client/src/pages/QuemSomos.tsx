import { useState } from "react";
import { Popup } from "@typebot.io/react";
import { Link } from 'wouter';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { 
  Shield, 
  Eye,
  Users,
  MessageCircleHeart,
  Target,
  Lightbulb,
  Heart,
  CheckCircle2,
  ArrowRight,
  Lock,
  Handshake,
  Building2,
  Landmark,
  Factory,
  Briefcase,
  Globe,
  Cpu,
  Rocket,
  Leaf,
  Zap,
  HeartHandshake,
  Mail,
  Send,
  Phone
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";



const pillars = [
    {
      icon: Target,
      title: "Missão",
      description: "Empoderar organizações a ouvir suas equipes de forma autêntica, criando ambientes de trabalho mais saudáveis e produtivos através do feedback anônimo e seguro."
    },
    {
      icon: Eye,
      title: "Visão",
      description: "Ser a plataforma referência em feedback corporativo anônimo, reconhecida pela excelência em privacidade e pelo impacto positivo na cultura organizacional."
    },
    {
      icon: Heart,
      title: "Valores",
      description: "Integridade, confidencialidade, respeito à diversidade, inovação responsável e compromisso inabalável com a privacidade de cada colaborador."
    }
];

const coreValues = [
    {
      icon: Shield,
      title: "Segurança e Privacidade",
      description: "Anonimato garantido em todas as etapas. Não coletamos dados pessoais, IPs ou informações que possam identificar o colaborador.",
      highlights: ["Criptografia de ponta", "Zero rastreamento", "LGPD compliant"]
    },
    {
      icon: Handshake,
      title: "Transparência e Confiança",
      description: "Construímos pontes entre colaboradores e gestores através de uma comunicação clara, honesta e sem intermediários.",
      highlights: ["Dados em tempo real", "Relatórios claros", "Sem filtros ocultos"]
    },
    {
      icon: Users,
      title: "Diversidade e Inclusão",
      description: "Acreditamos que todas as vozes importam. Nossa plataforma foi pensada para acolher perspectivas de todos os perfis.",
      highlights: ["Acessibilidade", "Múltiplos idiomas", "Design inclusivo"]
    },
    {
      icon: MessageCircleHeart,
      title: "Comunicação Ética",
      description: "Promovemos um ambiente onde o feedback é tratado com responsabilidade, respeito e foco em melhorias construtivas.",
      highlights: ["Moderação ética", "Foco em soluções", "Respeito mútuo"]
    }
];

const differentials = [
    "Sem coleta de IP ou cookies de rastreamento",
    "Não exigimos login para enviar feedback",
    "Criptografia de ponta a ponta",
    "Dashboard com análise de sentimento em tempo real",
    "Categorização inteligente de feedbacks",
    "Relatórios exportáveis para tomada de decisão"
];

const partners = [
    { name: "TechNova Solutions", icon: Cpu },
    { name: "GlobalCorp Brasil", icon: Globe },
    { name: "Indústria Vanguarda", icon: Factory },
    { name: "Banco Horizonte", icon: Landmark },
    { name: "StartUp Rocket", icon: Rocket },
    { name: "Grupo Empresarial União", icon: Building2 },
    { name: "EcoFuture", icon: Leaf },
    { name: "Energia Plus", icon: Zap },
    { name: "Consultoria Prime", icon: Briefcase },
    { name: "Instituto Solidário", icon: HeartHandshake },
];

export default function QuemSomos() {
  const [isTypebotOpen, setIsTypebotOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
    <Header />

      {/* Hero Section with High Contrast */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/diversity-hero.jpg')" }}
        />
        {/* Dark overlay for strong contrast */}
        <div className="absolute inset-0 bg-foreground/80" />
        
        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-8 shadow-lg">
            <Lock className="w-4 h-4" />
            Plataforma 100% Anônima e Segura
          </div>
          
          {/* Headline - Large and Bold */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Quem Somos
          </h1>
          
          {/* Subtitle - Clear and Readable */}
          <p className="text-xl md:text-2xl text-white/90 font-semibold mb-6 max-w-2xl mx-auto leading-relaxed">
            Feedback anônimo corporativo com <span className="text-primary-foreground underline decoration-primary decoration-4 underline-offset-4">segurança total</span>
          </p>
          
          {/* Supporting Text - Short and Objective */}
          <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Permitimos que empresas ouçam seus colaboradores de forma confidencial, 
            sem medo de represálias. Comunicação transparente para ambientes mais saudáveis.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Nosso Propósito
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed font-medium">
              Guiados por princípios sólidos, trabalhamos para transformar a cultura organizacional das empresas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Card 
                key={index} 
                className="border-border bg-card shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                    <pillar.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{pillar.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values - 4 Cards Grid */}
      <section className="py-20 px-6 bg-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Nossos Diferenciais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed font-medium">
              O que nos torna a escolha certa para empresas que valorizam a voz de seus colaboradores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => (
              <Card 
                key={index} 
                className="border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{value.title}</h3>
                      <p className="text-muted-foreground mb-5 leading-relaxed font-medium">{value.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {value.highlights.map((highlight, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
                Por que escolher o portAberta?
              </h2>
              <p className="text-muted-foreground mb-10 leading-relaxed text-base font-medium">
                Nossa plataforma foi desenvolvida com tecnologia de ponta para garantir que cada 
                feedback seja tratado com a máxima confidencialidade. Não somos apenas uma ferramenta, 
                somos um parceiro na construção de culturas organizacionais mais abertas e transparentes.
              </p>
              
              <div className="grid gap-4">
                {differentials.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-border bg-card shadow-lg">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">Como funciona?</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">1</div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Crie sua pesquisa</p>
                      <p className="text-muted-foreground font-medium">Configure perguntas e temas relevantes para sua equipe</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">2</div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Compartilhe o link</p>
                      <p className="text-muted-foreground font-medium">Envie o link único para seus colaboradores</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">3</div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Receba feedbacks anônimos</p>
                      <p className="text-muted-foreground font-medium">Colaboradores respondem sem revelar identidade</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">4</div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Analise os insights</p>
                      <p className="text-muted-foreground font-medium">Dashboard completo com análise de sentimento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-6 overflow-hidden bg-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Nossos Parceiros
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Empresas que confiam na portAberta para transformar sua cultura organizacional.
            </p>
          </div>

          <div className="relative">
            <div className="flex animate-marquee gap-6 w-max pr-6">
              {[...partners, ...partners].map((partner, index) => (
                <Card 
                  key={index} 
                  className="border-border bg-card hover:shadow-md transition-shadow duration-300 flex-shrink-0 w-48"
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <partner.icon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-medium text-foreground text-sm">{partner.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Mail className="w-4 h-4" />
                Entre em contato
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
                Fale Conosco
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed text-base font-medium">
                Tem alguma dúvida sobre nossa plataforma? Quer saber como o portAberta pode 
                ajudar sua empresa a construir uma cultura de feedback mais saudável? 
                Entre em contato conosco!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">E-mail</p>
                    <p className="text-muted-foreground text-sm">contato@portaberta.com.br</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Telefone</p>
                    <p className="text-muted-foreground text-sm">(11) 99999-9999</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-border bg-card shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome completo" 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input 
                      id="company" 
                      placeholder="Nome da sua empresa" 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Como podemos ajudar você?" 
                      className="bg-background min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2 font-semibold">
                    <Send className="w-4 h-4" />
                    Enviar mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
            Pronto para transformar a comunicação na sua empresa?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-base leading-relaxed font-medium">
            Comece a receber feedbacks anônimos hoje mesmo e tome decisões baseadas em dados reais 
            da sua equipe.
          </p>
          <Button size="lg" className="gap-2 text-base font-semibold px-8 py-6 shadow-lg" onClick={() => setIsTypebotOpen(true)}>
            Faça seu cadastro →
          </Button>
          <Popup
            typebot="porta-aberta-1c2pd9k"
            isOpen={isTypebotOpen}
            onClose={() => setIsTypebotOpen(false)}
          />

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/">
                <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img 
                    src="/images/logo-porta.png" 
                    alt="portAberta" 
                    className="h-10 w-auto"
                />
                <img 
                    src="/images/logo-nome.png" 
                    alt="portAberta" 
                    className="h-10 w-auto"
                />
                </a>
            </Link>
          <p className="text-sm text-muted-foreground">
            © 2026 portAberta. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};